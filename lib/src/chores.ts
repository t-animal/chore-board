import { Temporal } from "temporal-polyfill";
import { createCalendar, listEvents, modifyEventTitle } from "./calendar-facade.js";
import type { Color, GCalApi } from "./gcal-api-common.js";

const DEFAULT_CHORE_CALENDAR_NAME = "Chores";
const COMPLETED_PREFIX = "✓ ";

export class ChoresApi {
  private calendarId: string | null = null;
  private calendarColor: Color | null = null;

  constructor(
    private gcal: GCalApi,
    private choreCalendarId: string,
  ) {}

  createSampleChoresCalendar() {
    return createCalendar(this.gcal, DEFAULT_CHORE_CALENDAR_NAME);
  }

  async getChores(daysInPast: number, daysInFuture: number, maxChores: number): Promise<Chore[]> {
    const { calendarId, calendarColor } = await this.getCalendarInfo();
    const events = await listEvents(this.gcal, calendarId, daysInPast, daysInFuture, maxChores);

    return events.map(
      (event) =>
        new Chore(
          event.id,
          event.summary,
          event.description || "",
          event.start,
          event.color ?? calendarColor,
        ),
    );
  }

  async markChoreComplete(choreId: string) {
    const { calendarId } = await this.getCalendarInfo();
    const result = await modifyEventTitle(
      this.gcal,
      calendarId,
      choreId,
      COMPLETED_PREFIX,
      "prepend",
    );

    if (!result.success) {
      throw result.error instanceof Error ? result.error : new Error(String(result.error));
    }

    return new Chore(
      result.data.id,
      result.data.summary,
      result.data.description ?? "",
      result.data.start,
      result.data.color ?? this.calendarColor,
    );
  }

  async markChoreIncomplete(choreId: string) {
    const { calendarId } = await this.getCalendarInfo();
    const result = await modifyEventTitle(
      this.gcal,
      calendarId,
      choreId,
      COMPLETED_PREFIX,
      "remove",
    );

    if (!result.success) {
      throw result.error instanceof Error ? result.error : new Error(String(result.error));
    }

    return new Chore(
      result.data.id,
      result.data.summary,
      result.data.description ?? "",
      result.data.start,
      result.data.color ?? this.calendarColor,
    );
  }

  private async getCalendarInfo(): Promise<{ calendarId: string; calendarColor: Color | null }> {
    if (this.calendarId) {
      return { calendarId: this.calendarId, calendarColor: this.calendarColor };
    }

    const calendars = await this.gcal.listCalendars();
    const choreCalendar = calendars.find((c) => c.id === this.choreCalendarId);
    if (!choreCalendar) {
      throw new Error(`Chore calendar with id "${this.choreCalendarId}" not found`);
    }
    this.calendarId = choreCalendar.id;
    this.calendarColor = choreCalendar.color;

    return { calendarId: choreCalendar.id, calendarColor: this.calendarColor };
  }
}

export class Chore {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public dueDate: Temporal.Instant,
    public color: Color | null,
  ) {}

  public isCompleted() {
    return this.title.startsWith(COMPLETED_PREFIX);
  }

  public isPastDue() {
    return this.isDueBefore(Temporal.Now.instant());
  }

  public isDueToday() {
    const startOfToday = this.getStartOfToday();
    const startOfTomorrow = this.getStartOfTomorrow();

    return (
      this.dueDate.epochMilliseconds >= startOfToday.epochMilliseconds &&
      this.dueDate.epochMilliseconds < startOfTomorrow.epochMilliseconds
    );
  }

  public isDueBefore(date: Temporal.Instant) {
    return this.dueDate.epochMilliseconds < date.epochMilliseconds;
  }
  public isDueAfterOrAt(date: Temporal.Instant) {
    return this.dueDate.epochMilliseconds >= date.epochMilliseconds;
  }

  private getStartOfToday(): Temporal.Instant {
    return Temporal.Now.zonedDateTimeISO().startOfDay().toInstant();
  }

  private getStartOfTomorrow(): Temporal.Instant {
    const startOfToday = this.getStartOfToday();
    return startOfToday.add(Temporal.Duration.from({ hours: 24 })); // This breaks on DST changes? why can't we add 1 day?
  }
}
