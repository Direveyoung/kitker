export type PetalColor = "yellow" | "pink" | "purple" | "blue";

export type CalendarDTO = {
  id: string;
  name: string;
  color: PetalColor;
  orderIndex: number;
};

export type CalendarEvent = {
  id: string;
  calendarId: string | null;
  title: string;
  startsAt: string; // ISO(UTC) 또는 'YYYY-MM-DD'(all_day)
  endsAt: string | null;
  allDay: boolean;
  location: string | null;
  description: string | null;
  color: PetalColor;
};

export type EventInput = {
  id?: string;
  calendarId: string | null;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location?: string | null;
  description?: string | null;
};
