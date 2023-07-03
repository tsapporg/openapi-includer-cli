import fs from 'fs';
import yaml from 'yaml';
import path from 'path';
import { flatten, unflatten } from 'flat';
import merge from 'ts-deepmerge';

export default class OpenAPIYAMLFileGenerator {
  basePath: string;
  _api: any;

  constructor(absolutePathOfOpenAPISpec: string) {
    console.debug(absolutePathOfOpenAPISpec);

    this.basePath = absolutePathOfOpenAPISpec.replace(`/${path.basename(absolutePathOfOpenAPISpec)}`, '');
    console.debug('basePath', this.basePath);

    this._api = this.tryResolveIncludesForFile(absolutePathOfOpenAPISpec);
    console.debug('_api', this._api);

    fs.writeFileSync(`${this.basePath}/_api.yaml`, this._api);
  }

  tryResolveIncludesForFile(filePath: string): string {
    console.debug('tryResolveIncludesForFile', filePath);

    const file = fs.readFileSync(filePath, 'utf8');
    
    const yamlObject = yaml.parse(file);
    console.debug('yamlObject', yamlObject);

    const flattenedYAML: any = flatten(yamlObject);
    
    console.debug('flatten', flattenedYAML);

    let previousKey: undefined | string, replace: any = {}, includes: any[] = [];

    Object.keys(flattenedYAML).forEach((key: string) => {
      if (key.indexOf('$includes.0') !== -1) { // Start new includes.
        // Replace text in file with the reference.
        console.debug('include 0', flattenedYAML[key]);

        if (previousKey) { replace[previousKey.replace('.$includes.0', '')] = includes; }

        includes = [];
        previousKey = key;
      }

      if (key.indexOf('$includes') !== -1) {
        console.debug('include', flattenedYAML[key]);

        includes.push(this.tryResolveInclude(flattenedYAML[key]));
      }
    });

    // Last occurrence.
    replace[previousKey!.replace('.$includes.0', '')] = includes;

    console.debug(replace);

    const newObj: any = {};

    Object.keys(replace).forEach((flattenedKey: any) => {
      console.debug('flattenedKey', flattenedKey);

      let fileContents = '', offset = '';

      flattenedKey.split('.').forEach((key: string) => {
        console.debug(key);
        fileContents = `${fileContents}\n${offset}${key}:`;
        offset = `${offset}  `;
      });

      let innerContents = {};
      replace[flattenedKey].forEach((item: string) => {
        console.debug('item', item);

        const innerYamlObject = yaml.parse(item);
        console.debug('innerYamlObject', innerYamlObject);

        innerContents = merge(innerContents, innerYamlObject);
      });

      newObj[flattenedKey] = innerContents;
    });

    console.debug(JSON.stringify(newObj, null, 2));

    const flattenedYAMLWithoutIncludes: any = Object.keys(flattenedYAML)
      .filter(key => key.indexOf('$includes.') === -1)
      .reduce((obj: any, key: string) => {
        obj[key] = flattenedYAML[key];
        return obj;
      }, {});

    const newYAML = merge(unflatten(flattenedYAMLWithoutIncludes), unflatten(newObj) as any);
    console.debug(JSON.stringify(newYAML, null, 2));

    return yaml.stringify(newYAML);
  }

  private tryResolveInclude($include: string): string {
    console.debug('tryResolveInclude', $include);

    let includePath = path.basename($include);

    if (!path.isAbsolute($include)) { 
      if ($include.startsWith('.')) {
        includePath = $include.replace('.', '');
      } else if ($include.startsWith('./')) {
        includePath = $include.replace('./', '');
      }
    }
    console.debug('includePath', includePath);
    
    const absolutePathToInclude = `${this.basePath}/${includePath}`;
    console.debug('absolutePathToInclude', absolutePathToInclude);
    const includeContents = fs.readFileSync(absolutePathToInclude);
    console.debug(includeContents.toString());

    // TODO if includes -> continue parsing

    return includeContents.toString();
  }
}