import moment, { Moment } from 'moment';
import { CalendarEvent } from './calendarApiFacade';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

class RecurringOneDayEvent {
  static colorsTaken = 0;

  private interval = 1;
  private frequency = 'MONTHLY'
  private date = moment();
  private color = RecurringOneDayEvent.colorsTaken++;

  constructor(
    private summary: string
  ) { }

  startOn(date: Moment): RecurringOneDayEvent {
    this.date = date;
    return this;
  }

  repeatEvery(interval: number, frequency: 'months' | 'days' | 'weeks'): RecurringOneDayEvent {
    this.interval = interval;
    this.frequency = frequency.substr(0, frequency.length - 1).toUpperCase() + 'LY';
    return this;
  }

  asPayload(): CalendarEvent {
    return {
      summary: this.summary,
      start: {
        date: this.date.format('YYYY-MM-DD')
      },
      end: {
        date: this.date.format('YYYY-MM-DD')
      },
      recurrence: [
        `RRULE:FREQ=${this.frequency};INTERVAL=${this.interval};`
      ],
      colorId: this.color + ''
    };
  }
}

export function createNewCalendar(): Promise<string> {
  return new Promise((resolve, reject) => {

    type Response<T> = gapi.client.Response<T>;
    type Calendar = gapi.client.calendar.Calendar;

    gapi.load('client:auth2', async () => {
      try {
        const options = new gapi.auth2.SigninOptionsBuilder().setScope(SCOPES.join(' '));

        const currentUser = gapi.auth2.getAuthInstance().currentUser.get();

        await new Promise((...callbacks) =>
          currentUser.grant(options).then(...callbacks));

        const response = await new Promise((...callbacks) =>
          gapi.client.calendar.calendars.insert({summary: 'Chores'} as any).then(...callbacks));

        resolve((response as Response<Calendar>).result?.id);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function insertSampleEvents(calendarId: string): Promise<void> {
  const toothbrush = new RecurringOneDayEvent('Change toothbrush')
    .startOn(moment().subtract(1, 'day'))
    .repeatEvery(3, 'months');
  const linens = new RecurringOneDayEvent('Change linens')
    .startOn(moment().add(2, 'day'))
    .repeatEvery(3, 'weeks');
  const windows = new RecurringOneDayEvent('Clean windows')
    .startOn(moment().month(7).date(1))
    .repeatEvery(6, 'months');
  const tires = new RecurringOneDayEvent('Check/Change car tires')
    .startOn(moment().month(3).date(1))
    .repeatEvery(6, 'months');
  const smoke = new RecurringOneDayEvent('Check smoke detectors')
    .startOn(moment().month(1).date(1))
    .repeatEvery(5, 'months');
  const decalcify = new RecurringOneDayEvent('Decalcify faucets')
    .startOn(moment().add(14, 'days'))
    .repeatEvery(5, 'months');

  const insert = (event: RecurringOneDayEvent): Promise<void> =>
    new Promise((resolve, reject) =>
      gapi.client.calendar.events
        .insert({ calendarId, ...event.asPayload() })
        .then(() => resolve(), () => reject())
    );

  await Promise.all([
    insert(toothbrush),
    insert(linens),
    insert(windows),
    insert(tires),
    insert(smoke),
    insert(decalcify)
  ]);
}
