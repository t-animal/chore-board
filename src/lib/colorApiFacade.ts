type Color = gapi.client.calendar.ColorDefinition;
type ColorType = 'calendar' | 'event';
type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void;
type RejectFunction = (reason?: unknown) => void;

let colors: gapi.client.calendar.Colors;
let initiated = false;
const outstandingColorPromises: Parameters<typeof resolveColor>[] = [];

export function getCalendarColor(colorId: string): Promise<Color> {
  return getColor(colorId, 'calendar');
}

export function getEventColor(colorId: string): Promise<Color> {
  return getColor(colorId, 'event');
}

function getColor(colorId: string, source: ColorType): Promise<Color> {
  init();
  return new Promise((resolve, reject) => {
    if (colors === undefined) {
      outstandingColorPromises.push([colorId, source, resolve, reject]);
      return;
    }

    resolveColor(colorId, source, resolve, reject);
  });
}

function resolveColor(colorId: string, source: ColorType, resolve: ResolveFunction<Color>, reject: RejectFunction): void {
  if (!colors || !colors.calendar || !colors.event) {
    return reject('Could not resolve color');
  }

  resolve((source === 'calendar' ? colors.calendar : colors.event)[colorId]);
}

function resolveOutstandingColorPromises(): void {
  for (const outstandingColorPromise of outstandingColorPromises) {
    resolveColor(...outstandingColorPromise);
  }
}

function init(): void {
  if (initiated) {
    return;
  }

  gapi.client.calendar.colors
    .get({})
    .then(colorResponse => colors = colorResponse.result)
    .then(resolveOutstandingColorPromises);

  initiated = true;
}
