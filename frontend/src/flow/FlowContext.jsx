import React, { createContext, useContext } from 'react';

const FlowContext = createContext(null);

export const useFlow = () => useContext(FlowContext);
export const FlowProvider = FlowContext.Provider;
