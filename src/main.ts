#!/usr/bin/env node
import path from 'path';
import OpenAPIYAMLFileGenerator from './OpenAPIYAMLFileGenerator';

const generateOpenAPIYAMLFile = async (absolutePathOfODistDir: string, absolutePathOfOpenAPISpec: string) => {
  console.debug('generating _api.yaml from api.yaml file and its $refs', absolutePathOfODistDir, absolutePathOfOpenAPISpec);
  
  new OpenAPIYAMLFileGenerator(absolutePathOfODistDir, absolutePathOfOpenAPISpec);
}

console.debug('args', process.argv);

const distDirPath = process.argv.at(-2);
console.debug('distDirPath', distDirPath);

const absolutePathOfODistDir = path.resolve(distDirPath!);
console.debug('absolutePathOfODistDir', absolutePathOfODistDir);

const openAPIYAMLFilePath = process.argv.at(-1);
console.debug('openAPIYAMLFilePath', openAPIYAMLFilePath);

const absolutePathOfOpenAPISpec = path.resolve(openAPIYAMLFilePath!);
console.debug('absolutePathOfOpenAPISpec', absolutePathOfOpenAPISpec);

generateOpenAPIYAMLFile(absolutePathOfODistDir, absolutePathOfOpenAPISpec);