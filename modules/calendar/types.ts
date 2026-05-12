export type CalEvent = {
  id: string;
  title: string;
  body: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  isAllDay: boolean;
};
