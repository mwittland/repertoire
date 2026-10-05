update public.drills
set type = 'Partner+'
where name in (
  'Poach Communication',
  'Bert Coordination',
  'Partner Movement Mirror',
  'Live Kitchen Rally',
  'Live Transition Rally',
  'Serve Return Third Ball'
);

update public.drills
set type = 'Ball Machine'
where name in (
  'Random Feed Recognition',
  'Shot Selection Circuit',
  'Pressure Point Reps'
);

update public.drills
set type = 'Wall'
where name in (
  'Consistency to Pressure',
  'Target Three Zones',
  'Repertoire Review Circuit'
);
