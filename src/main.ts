#!/usr/bin/env node
import path from 'path';
import OpenAPIYAMLFileGenerator from './OpenAPIYAMLFileGenerator';

const generateOpenAPIYAMLFile = async (absolutePathOfOpenAPISpec: string) => {
  console.debug('generating _api.yaml from api.yaml file and its $refs', absolutePathOfOpenAPISpec);
  
  new OpenAPIYAMLFileGenerator(absolutePathOfOpenAPISpec);
}

console.debug('args', process.argv);

const openAPIYAMLFilePath = process.argv.at(-1);
console.debug('openAPIYAMLFilePath', openAPIYAMLFilePath);

const absolutePathOfOpenAPISpec = path.resolve(openAPIYAMLFilePath!);
console.debug('openAPIYAMLFilePath', openAPIYAMLFilePath);

generateOpenAPIYAMLFile(absolutePathOfOpenAPISpec);