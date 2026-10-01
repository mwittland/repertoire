export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      shots: {
        Row: {
          id: string;
          name: string;
          court_x_min: number;
          court_x_max: number;
          court_y_min: number;
          court_y_max: number;
          ball_height_min: number;
          ball_height_max: number;
          intent_min: number;
          intent_max: number;
          video_url: string | null;
          description: string;
          difficulty: number;
          instructions: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gender: "Male" | "Female";
      shot_request_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};
