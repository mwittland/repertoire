CREATE TABLE IF NOT EXISTS `raw.game` (
  game_id STRING NOT NULL,
  match_id STRING NOT NULL,
  game_nbr INT64 NOT NULL,
  score_w INT64 NOT NULL,
  score_l INT64 NOT NULL,
  w_team_id STRING NOT NULL,
  l_team_id STRING NOT NULL,
  skill_lvl STRING NOT NULL,
  scoring_type STRING NOT NULL,
  ball_type STRING,
  dt_played DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS `raw.rally` (
  rally_id STRING NOT NULL,
  game_id STRING NOT NULL,
  match_id STRING NOT NULL,
  rally_nbr INT64 NOT NULL,
  w_team_id STRING NOT NULL,
  srv_team_id STRING NOT NULL,
  srv_player_id STRING NOT NULL,
  rtrn_team_id STRING NOT NULL,
  rtrn_player_id STRING NOT NULL,
  ts_player_id STRING NOT NULL,
  ts_type STRING,
  to_ind STRING NOT NULL,
  to_team_id STRING NOT NULL,
  rally_len INT64,
  ending_type STRING,
  ending_player_id STRING NOT NULL,
  srv_switch_ind STRING NOT NULL,
  rtrn_switch_ind STRING NOT NULL,
  srv_team_flipped_ind STRING NOT NULL,
  rtrn_team_flipped_ind STRING NOT NULL,
  srv_team_rs_player_id STRING NOT NULL,
  srv_team_ls_player_id STRING NOT NULL,
  rtrn_team_rs_player_id STRING NOT NULL,
  rtrn_team_ls_player_id STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS `raw.shot` (
  shot_id STRING NOT NULL,
  rally_id STRING NOT NULL,
  shot_nbr INT64 NOT NULL,
  shot_type STRING,
  player_id STRING,
  loc_x FLOAT64,
  loc_y FLOAT64,
  next_loc_x FLOAT64,
  next_loc_y FLOAT64
);
