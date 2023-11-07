/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/model1": {
    get: operations["getModel1"];
  };
  "/model2": {
    get: operations["getModel2"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    Model1: {
      prop1: string;
    };
    Model2: {
      prop2: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  getModel1: {
    responses: {
      200: {
        content: {
          "application/json": {
            prop1: string;
          };
        };
      };
    };
  };
  getModel2: {
    responses: {
      200: {
        content: {
          "application/json": {
            prop2: string;
          };
        };
      };
    };
  };
}
