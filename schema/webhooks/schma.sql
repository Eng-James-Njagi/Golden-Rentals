create or replace function notify_new_account()
returns trigger language plpgsql as $$
begin
  perform net.http_post(
    url := 'https://www.pedurentals.com/api/webhooks/notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '@Testing!125Notificationsadmin34569'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'Listers_Info',
      'record', row_to_json(NEW)
    )
  );
  return NEW;
end;
$$;

create trigger on_account_created
after insert on public."Listers_Info"
for each row execute function notify_new_account();

create or replace function notify_account_deleted()
returns trigger language plpgsql as $$
begin
  perform net.http_post(
    url := 'https://www.pedurentals.com/api/webhooks/notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '@Testing!125Notificationsadmin34569'
    ),
    body := jsonb_build_object(
      'type', 'DELETE',
      'table', 'Listers_Info',
      'old_record', row_to_json(OLD)
    )
  );
  return OLD;
end;
$$;

create trigger on_account_deleted
after delete on public."Listers_Info"
for each row execute function notify_account_deleted();

create or replace function notify_new_listing()
returns trigger language plpgsql as $$
begin
  perform net.http_post(
    url := 'https://www.pedurentals.com/api/webhooks/notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '@Testing!125Notificationsadmin34569'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'Property_Listing',
      'record', row_to_json(NEW)
    )
  );
  return NEW;
end;
$$;

create trigger on_listing_created
after insert on public."Property_Listing"
for each row execute function notify_new_listing();

create or replace function notify_listing_deleted()
returns trigger language plpgsql as $$
begin
  perform net.http_post(
    url := 'https://www.pedurentals.com/api/webhooks/notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '@Testing!125Notificationsadmin34569'
    ),
    body := jsonb_build_object(
      'type', 'DELETE',
      'table', 'Property_Listing',
      'old_record', row_to_json(OLD)
    )
  );
  return OLD;
end;
$$;

create trigger on_listing_deleted
after delete on public."Property_Listing"
for each row execute function notify_listing_deleted();