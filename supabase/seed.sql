insert into public.shots (name, court_x_min, court_x_max, court_x_left_min, court_x_left_max, court_y_min, court_y_max, ball_height_min, ball_height_max, intent_min, intent_max, difficulty, description, instructions)
values
  ('Third Shot Drop', -10, 2, -2, 10, 18, 30, 5, 8, 60, 90, 3, 'A soft reset that gives you time to move forward.', 'Use a relaxed swing and let the ball arc deep into the kitchen.'),
  ('Forehand Drive', -5, 5, -5, 5, 15, 30, 3, 6, 60, 95, 2, 'A firm, attacking shot from the back half of the court.', 'Contact the ball in front and finish toward your target.'),
  ('Crosscourt Dink', 0, 15, -15, 0, 0, 15, 1, 4, 30, 70, 2, 'A patient diagonal dink that moves your opponent laterally.', 'Keep the paddle face open and clear the net by a small margin.');

insert into public.drills (name, description)
values
  ('Reset and Advance', 'Alternate drops and drives while moving from the baseline to the kitchen.'),
  ('Diagonal Dink Ladder', 'Build control with progressively deeper crosscourt dinks.');

insert into public.shot_drills (shot_id, drill_id)
select shots.id, drills.id
from public.shots, public.drills
where (shots.name = 'Third Shot Drop' and drills.name = 'Reset and Advance')
  or (shots.name = 'Forehand Drive' and drills.name = 'Reset and Advance')
  or (shots.name = 'Third Shot Drop' and drills.name = 'Diagonal Dink Ladder')
  or (shots.name = 'Crosscourt Dink' and drills.name = 'Diagonal Dink Ladder');