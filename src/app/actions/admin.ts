"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export type AdminFormState = { error?: string };

const optionalUrl = z
  .union([z.string().url(), z.literal("")])
  .transform((value) => value || null);
const shotSchema = z
  .object({
    name: z.string().trim().min(2),
    courtXMin: z.coerce.number().min(-15).max(15),
    courtXMax: z.coerce.number().min(-15).max(15),
    courtYMin: z.coerce.number().min(0).max(30),
    courtYMax: z.coerce.number().min(0).max(30),
    ballHeightMin: z.coerce.number().min(0).max(10),
    ballHeightMax: z.coerce.number().min(0).max(10),
    shotType: z.enum([
      "Dink",
      "Drop",
      "Drive",
      "Reset",
      "Attack",
      "Putaway",
      "Lob",
    ]),
    aggressionScore: z.coerce.number().int().min(0).max(100),
    difficulty: z.coerce.number().int().min(0).max(100),
    videoUrl: optionalUrl,
    description: z.string().trim().min(1),
    instructions: z.string().trim().min(1),
  })
  .refine((data) => data.courtXMin <= data.courtXMax, {
    message: "Court X minimum must be no greater than maximum.",
  })
  .refine((data) => data.courtYMin <= data.courtYMax, {
    message: "Court Y minimum must be no greater than maximum.",
  })
  .refine((data) => data.ballHeightMin <= data.ballHeightMax, {
    message: "Ball height minimum must be no greater than maximum.",
  });

const drillSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["Solo", "Wall", "Ball Machine", "Partner+"]),
  courtXMin: z.coerce.number().min(-15).max(15),
  courtXMax: z.coerce.number().min(-15).max(15),
  courtYMin: z.coerce.number().min(0).max(30),
  courtYMax: z.coerce.number().min(0).max(30),
  ballHeightMin: z.coerce.number().min(0).max(10),
  ballHeightMax: z.coerce.number().min(0).max(10),
  description: z.string().trim().min(1),
  videoUrl: optionalUrl,
}).refine((data) => data.courtXMin <= data.courtXMax && data.courtYMin <= data.courtYMax && data.ballHeightMin <= data.ballHeightMax, {
  message: "Court coverage minimums must not exceed maximums.",
});

async function requireAdmin(nextPath = "/admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${nextPath}`);
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/");
  return supabase;
}

const idsSchema = z.array(z.string().uuid());

async function syncShotDrills(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  shotId: string,
  drillIds: string[],
) {
  await supabase.from("shot_drills").delete().eq("shot_id", shotId);
  if (drillIds.length)
    await supabase
      .from("shot_drills")
      .insert(
        drillIds.map((drillId) => ({ shot_id: shotId, drill_id: drillId })),
      );
}

async function syncDrillShots(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  drillId: string,
  shotIds: string[],
) {
  await supabase.from("shot_drills").delete().eq("drill_id", drillId);
  if (shotIds.length)
    await supabase
      .from("shot_drills")
      .insert(
        shotIds.map((shotId) => ({ shot_id: shotId, drill_id: drillId })),
      );
}

export async function createShot(
  _: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = shotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the shot details.",
    };
  const supabase = await requireAdmin("/admin/shots/new");
  const drillIds = idsSchema.parse(formData.getAll("drillIds"));
  const { data: createdShot, error } = await supabase
    .from("shots")
    .insert({
      name: parsed.data.name,
      court_x_min: parsed.data.courtXMin,
      court_x_max: parsed.data.courtXMax,
      court_x_left_min: -parsed.data.courtXMax,
      court_x_left_max: -parsed.data.courtXMin,
      court_y_min: parsed.data.courtYMin,
      court_y_max: parsed.data.courtYMax,
      ball_height_min: parsed.data.ballHeightMin,
      ball_height_max: parsed.data.ballHeightMax,
      shot_type: parsed.data.shotType,
      aggression_score: parsed.data.aggressionScore,
      difficulty: parsed.data.difficulty,
      video_url: parsed.data.videoUrl,
      description: parsed.data.description,
      instructions: parsed.data.instructions,
    })
    .select("id")
    .single();
  if (error || !createdShot)
    return { error: "Unable to create this shot right now." };
  await syncShotDrills(supabase, createdShot.id, drillIds);
  revalidatePath("/shots");
  redirect("/admin");
}

export async function createDrill(
  _: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = drillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the drill details.",
    };
  const supabase = await requireAdmin("/admin/drills/new");
  const shotIds = idsSchema.parse(formData.getAll("shotIds"));
  const { data: createdDrill, error } = await supabase
    .from("drills")
    .insert({
      name: parsed.data.name,
      type: parsed.data.type,
      court_x_min: parsed.data.courtXMin,
      court_x_max: parsed.data.courtXMax,
      court_x_left_min: -parsed.data.courtXMax,
      court_x_left_max: -parsed.data.courtXMin,
      court_y_min: parsed.data.courtYMin,
      court_y_max: parsed.data.courtYMax,
      ball_height_min: parsed.data.ballHeightMin,
      ball_height_max: parsed.data.ballHeightMax,
      description: parsed.data.description,
      video_url: parsed.data.videoUrl,
    })
    .select("id")
    .single();
  if (error || !createdDrill)
    return { error: "Unable to create this drill right now." };
  await syncDrillShots(supabase, createdDrill.id, shotIds);
  revalidatePath("/drills");
  redirect("/admin");
}

export async function updateShot(
  _: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = shotSchema.safeParse(Object.fromEntries(formData));
  if (!id.success || !parsed.success)
    return {
      error: parsed.success
        ? "Invalid shot id."
        : (parsed.error.issues[0]?.message ?? "Check the shot details."),
    };
  const supabase = await requireAdmin(`/admin/shots/${id.data}/edit`);
  const drillIds = idsSchema.parse(formData.getAll("drillIds"));
  const { error } = await supabase
    .from("shots")
    .update({
      name: parsed.data.name,
      court_x_min: parsed.data.courtXMin,
      court_x_max: parsed.data.courtXMax,
      court_x_left_min: -parsed.data.courtXMax,
      court_x_left_max: -parsed.data.courtXMin,
      court_y_min: parsed.data.courtYMin,
      court_y_max: parsed.data.courtYMax,
      ball_height_min: parsed.data.ballHeightMin,
      ball_height_max: parsed.data.ballHeightMax,
      shot_type: parsed.data.shotType,
      aggression_score: parsed.data.aggressionScore,
      difficulty: parsed.data.difficulty,
      video_url: parsed.data.videoUrl,
      description: parsed.data.description,
      instructions: parsed.data.instructions,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id.data);
  if (error) return { error: "Unable to update this shot right now." };
  await syncShotDrills(supabase, id.data, drillIds);
  revalidatePath("/shots");
  revalidatePath(`/shots/${id.data}`);
  redirect("/admin/shots");
}

export async function deleteShot(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid shot id.");
  const supabase = await requireAdmin("/admin/shots");
  const { error } = await supabase.from("shots").delete().eq("id", id.data);
  if (error) throw new Error(`Unable to delete shot: ${error.message}`);
  revalidatePath("/shots");
  redirect("/admin/shots");
}

export async function updateDrill(
  _: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = drillSchema.safeParse(Object.fromEntries(formData));
  if (!id.success || !parsed.success)
    return {
      error: parsed.success
        ? "Invalid drill id."
        : (parsed.error.issues[0]?.message ?? "Check the drill details."),
    };
  const supabase = await requireAdmin(`/admin/drills/${id.data}/edit`);
  const shotIds = idsSchema.parse(formData.getAll("shotIds"));
  const { error } = await supabase
    .from("drills")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description,
      video_url: parsed.data.videoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id.data);
  if (error) return { error: "Unable to update this drill right now." };
  await syncDrillShots(supabase, id.data, shotIds);
  revalidatePath("/drills");
  revalidatePath(`/drills/${id.data}`);
  redirect("/admin/drills");
}

export async function deleteDrill(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid drill id.");
  const supabase = await requireAdmin("/admin/drills");
  const { error } = await supabase.from("drills").delete().eq("id", id.data);
  if (error) throw new Error(`Unable to delete drill: ${error.message}`);
  revalidatePath("/drills");
  redirect("/admin/drills");
}

export async function updateShotRequestStatus(formData: FormData) {
  const parsed = statusSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Invalid request update.");
  const supabase = await requireAdmin();
  const { data: savedRequest, error } = await supabase
    .from("shot_requests")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.requestId)
    .select("status")
    .single();
  if (error) throw new Error(`Unable to update request: ${error.message}`);
  if (savedRequest.status !== parsed.data.status)
    throw new Error("The request status was not saved.");
  revalidatePath("/admin/requests");
  redirect("/admin/requests");
}

export async function updateDrillRequestStatus(formData: FormData) {
  const parsed = statusSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Invalid drill request update.");
  const supabase = await requireAdmin();
  const { data: savedRequest, error } = await supabase
    .from("drill_requests")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.requestId)
    .select("status")
    .single();
  if (error)
    throw new Error(`Unable to update drill request: ${error.message}`);
  if (savedRequest.status !== parsed.data.status)
    throw new Error("The drill request status was not saved.");
  revalidatePath("/admin/requests");
  redirect("/admin/requests");
}
