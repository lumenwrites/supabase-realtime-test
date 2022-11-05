create table messages (
  id serial primary key,
  message text,
  room_id text,
  created_at timestamptz default now()
)

begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;

  -- re-create the supabase_realtime publication with no tables and only for insert
  create publication supabase_realtime with (publish = 'insert');
commit;

-- add a table to the publication
alter publication supabase_realtime add table messages;
