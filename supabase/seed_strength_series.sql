-- Strength Training Challenge — 16 July-2026 sessions (recordings + rest days).
-- Matches the series by name (edit the ilike if your title differs).
-- Rest days have no recording_link. All marked completed so they show as the
-- recording library + count toward progress. Run in the Supabase SQL Editor.

insert into public.sessions
  (challenge_id, day_number, title, description, category, session_type, recording_link, completed, duration_minutes, scheduled_at)
select c.id, v.day, v.title, v.descr, v.cat, 'recording', v.link, true, 45, v.dt::timestamptz
from (
  select id from public.challenges
  where name ilike '%strength%' and name ilike '%challenge%'
  order by created_at desc limit 1
) c
cross join (values
  (1,  'Full Body Strength & Mobility', 'A complete full-body session blending strength work with mobility drills to build a strong, supple base.', 'Strength Training', 'https://us06web.zoom.us/rec/share/j-7TfsCdGOxV_qz5Qb9BBQu6orTgencnp4lVangb90BhMSFHnqoKYlUEy1Vu0Gfa.OE3tqoUwnGhDOysc', '2026-07-01 07:00:00+05:30'),
  (2,  'Lower Body & Core Stability', 'Targets legs and core with stability-focused movements for better balance and a solid foundation.', 'Strength Training', 'https://us06web.zoom.us/rec/share/c5FhHfG7aYaVLYiGRw4E1Qb6guFOOwPS9hWdFkr5M3SKiIBhKHWXfx1Ep4xN2-cG.wrfD7EBXz5MtPogt', '2026-07-02 07:00:00+05:30'),
  (3,  'Active Recovery & Mobility', 'A gentle recovery session with mobility flows to ease soreness and keep the joints moving.', 'Yoga', 'https://us06web.zoom.us/rec/share/XMmORFHD1Ubal7TZTGtU-psZUY-Zk7Uqz-hJjJYOiPAGVgeZ79hN0Kyxl-mkpFrs.m3zgOjqV70aJyFiX', '2026-07-03 07:00:00+05:30'),
  (4,  'Upper Body & Core Strength', 'Builds upper-body and core strength through controlled, progressive movements.', 'Strength Training', 'https://us06web.zoom.us/rec/share/9FcpbeIrRENGIo4BpT3sPuatwsWEoOZ10gyXAk5s3DkLzBM1icDcbrT42vDrYKdA.KWMHYCjZVNcl3Uwc', '2026-07-04 07:00:00+05:30'),
  (5,  'Full Body Endurance & Stretching', 'Endurance-style full-body work finished with a deep stretch to improve stamina and flexibility.', 'Strength Training', 'https://drive.google.com/file/d/1j_fGu0cpgDDNBMqrNK2hI_ARs1M94k6C/view?usp=sharing', '2026-07-05 07:00:00+05:30'),
  (6,  'Surya Namaskar', 'A guided Surya Namaskar flow to energize the body, build warmth and improve breathing.', 'Yoga', 'https://us06web.zoom.us/rec/share/E3DQ1fvC88YUH3xGnzdw9f8sIlwWJz06sMZiL8SB3ewfiYW_p3om5VwJsRaq2NB5.DQzaNkQoOPOxxj3j', '2026-07-06 07:00:00+05:30'),
  (7,  'Rest & Recovery', 'Rest day. Take it easy, hydrate well and let your muscles recover for the week ahead.', 'Yoga', NULL, '2026-07-07 07:00:00+05:30'),
  (8,  'Push Day', 'A push-focused strength session for chest, shoulders and triceps.', 'Strength Training', 'https://us06web.zoom.us/rec/share/r2u-hjiSvoL_IlDM5TBaWqMrFN_6Cz34zsx_ijcldhHtvvHx7KHdMqXhrdEywRzy.yPZO4TFVa1RRJNIl', '2026-07-08 07:00:00+05:30'),
  (9,  'Pull Day', 'A pull-focused session strengthening the back and biceps with controlled reps.', 'Strength Training', 'https://us06web.zoom.us/rec/share/cgWw9TviFvfH5JJDhhJWKhbUxiJyhBuDw0y9MgVnBco7zb8OtzWMBzTauM56FQi6.u3M25xQ97uxGUhww', '2026-07-09 07:00:00+05:30'),
  (10, 'Legs + Shoulders', 'A combined legs and shoulders workout for lower-body power and capped, strong shoulders.', 'Strength Training', 'https://us06web.zoom.us/rec/share/PhLSHJXrcpHOjRy5HihKLRQrtI9OV-ILiSDA6BrXY4hrCRy-fQJ7fiVFfzRiJ-6R.cwHrVXR-jwPzWjHr', '2026-07-10 07:00:00+05:30'),
  (11, 'Active Recovery', 'Light active recovery to boost circulation and loosen tight muscles. No heavy lifting today.', 'Yoga', NULL, '2026-07-11 07:00:00+05:30'),
  (12, 'Upper Body', 'A dedicated upper-body strength session covering the full pushing and pulling pattern.', 'Strength Training', 'https://us06web.zoom.us/rec/share/_-AT3ARJOdplchKSJeSboQL_KrbuiSbU_h5DAHA77Iw572nDh6dD4URZFLpWeF_t.ztihvlo95snM5mo', '2026-07-12 07:00:00+05:30'),
  (13, 'Lower Body', 'A lower-body strength session for stronger legs, glutes and overall power.', 'Strength Training', 'https://us06web.zoom.us/rec/share/UcQ9LgD1k7e9o6vXa8_YTPog0J1o8oAJZKShVZmWNzP0UVm3j42dI5uOrzpqSq23.0wHr9k7DUPc3mSZf', '2026-07-13 07:00:00+05:30'),
  (14, 'Rest Day', 'Full rest day. Recover, stretch lightly if you like, and come back fresh tomorrow.', 'Yoga', NULL, '2026-07-14 07:00:00+05:30'),
  (15, 'Full Body Strength & Mobility', 'A full-body strength and mobility session to reinforce the fundamentals and keep progressing.', 'Strength Training', 'https://us06web.zoom.us/rec/share/ODuP3wa_LHDNfkdSHJyB4vVDS4B_rs8RpYIuTqmuBaqnlob33OrBRUVqkm3sm6w-.azeDkJifaYzioHex', '2026-07-15 07:00:00+05:30'),
  (16, 'Dumbbell Core Workout', 'A focused dumbbell core workout to build a strong, stable midsection.', 'Weight Training', 'https://us06web.zoom.us/rec/share/j2bK14j90voizf8VncPzPXyzuZJLq6ogZujSquUpwpFNwaxsqZN4Ggh3POS3BLtQ.ZQZ1uWZ8sTItcF07', '2026-07-16 07:00:00+05:30')
) as v(day, title, descr, cat, link, dt)
where c.id is not null;
