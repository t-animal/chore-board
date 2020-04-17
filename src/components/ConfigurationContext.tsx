import React, { useState } from 'react';

import { DefaultConfiguration, loadConfig, storeConfig } from '../lib/storage';
import { createContext, Props } from 'react';
import { CleanUpTime } from '../typings/configuration';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
const defaultContext = {
  config: DefaultConfiguration,
  mutators: {
    setBacklogTimeSpan: (days: number) => { },
    setCleanUpTime: (time: CleanUpTime) => { },
    setCalendar: (calendarId: string) => { }
  }
};
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-empty-function */

export type ConfigurationContext = typeof defaultContext;

const context = createContext(defaultContext);
const config = loadConfig();

export const ConfigurationProvider = (props: Props<void>): JSX.Element => {
  const storeAndRerender = (): void => {
    storeConfig(contextState.config);
    setContextState({...contextState});
  };

  const mutators = {
    setBacklogTimeSpan: (days: number): void => {
      contextState.config.backlogTimeSpan = days;
      storeAndRerender();
    },
    setCleanUpTime: (time: CleanUpTime): void => {
      contextState.config.cleanUpTime = time;
      storeAndRerender();
    },
    setCalendar: (calendarId: string): void => {
      contextState.config.selectedCalendar = calendarId;
      storeAndRerender();
    }
  };

  const [contextState, setContextState] = useState<ConfigurationContext>({config, mutators});

  return (
    <context.Provider value={contextState}>
      {props.children}
    </context.Provider>
  );
};

export const ConfigurationConsumer = context.Consumer;
