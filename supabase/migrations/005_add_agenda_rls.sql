-- Add missing RLS policies for event_speakers and event_schedules

-- EVENT SPEAKERS
CREATE POLICY "Public can read speakers of published events" ON event_speakers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_speakers.event_id
      AND events.status = 'published'
      AND events.is_private = FALSE
    )
  );

CREATE POLICY "Organizers can manage own event speakers" ON event_speakers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_speakers.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all event speakers" ON event_speakers
  FOR ALL USING (is_platform_admin());

-- EVENT SCHEDULES
CREATE POLICY "Public can read schedules of published events" ON event_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_schedules.event_id
      AND events.status = 'published'
      AND events.is_private = FALSE
    )
  );

CREATE POLICY "Organizers can manage own event schedules" ON event_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_schedules.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all event schedules" ON event_schedules
  FOR ALL USING (is_platform_admin());
