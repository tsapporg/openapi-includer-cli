import fs from 'fs';
import yaml from 'yaml';
import path from 'path';
import { flatten, unflatten } from 'flat';
import merge from 'ts-deepmerge';

export default class OpenAPIYAMLFileGenerator {
  basePath: string;
  _api: any;

  constructor(absolutePathOfODistDir: string, absolutePathOfOpenAPISpec: string) {
    console.debug(absolutePathOfODistDir, absolutePathOfOpenAPISpec);

    this.basePath = absolutePathOfOpenAPISpec.replace(`/${path.basename(absolutePathOfOpenAPISpec)}`, '');
    console.debug('basePath', this.basePath);

    // We allow $includes outside of child directories of the main OpenAPI spec YAML.
    // In order to make this work, create a dist dir, copy all child YAMLs into it,
    //  then when we find $included files, we'll copy them into the dist dir as well,
    //  but we'll rename the $ref's so that any potential clobbering (files with same name)
    //  isn't an issue.
    fs.mkdirSync(absolutePathOfODistDir);

    const baseSpecDir = path.dirname(absolutePathOfOpenAPISpec);
    //absolutePathOfOpenAPISpec. TODO glob copy, then copy all $include files as well, updating $refs.

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
        console.debug('$includes key', flattenedYAML[key]);

        includes.push(this.tryResolveInclude(filePath, flattenedYAML[key]));
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

  private tryResolveInclude(filePath: string, $include: string): string {
    console.debug('tryResolveInclude', filePath, $include);

    //let includePath = path.basename($include);

    const absolutePathToInclude = path.resolve(this.basePath, $include);

    /* TODO validate this approach works for tests
    if (!path.isAbsolute($include)) { 
      if ($include.startsWith('.')) {
        includePath = $include.replace('.', '');
      } else if ($include.startsWith('./')) {
        includePath = $include.replace('./', '');
      }
    }
    
    console.debug('includePath', includePath);
    
    const absolutePathToInclude = `${this.basePath}/${includePath}`;
    */
    console.debug('absolutePathToInclude', absolutePathToInclude);
    const includeContents = fs.readFileSync(absolutePathToInclude);
    console.debug(includeContents.toString());

    // TODO Currently we don't support nested $includes.
    // But, we do need to adjust the $ref(s) any $includes may use: $refs are relative!
    // For $refs in includes, they need to be read and included in the string we return.
    // This is because $ref is looking for a relative path.
    // If we didn't do this, we'd need to copy $ref'ed files into the dist dir we create.
    // That would be fine I guess?
    const file = fs.readFileSync(filePath, 'utf8');

    const yamlObject = yaml.parse(file);
    console.debug('yamlObject', yamlObject);

    const flattenedYAML: any = flatten(yamlObject);
    
    console.debug('flatten', flattenedYAML);

    let previousKey: undefined | string, replace: any = {}, refs: any[] = [];

    Object.keys(flattenedYAML).forEach((key: string) => {
      if (key.indexOf('$ref.0') !== -1) { // Start new includes.
        // Replace text in file with absolute path to reference.
        console.debug('ref 0', flattenedYAML[key]);

        if (previousKey) { replace[previousKey.replace('.$ref.0', '')] = refs; }

        refs = [];
        previousKey = key;
      }

      if (key.indexOf('$ref') !== -1) {
        console.debug('$ref key', flattenedYAML[key]);

        refs.push(flattenedYAML[key]);
      }
    });

    // Last occurrence.
    replace[previousKey!.replace('.$ref.0', '')] = refs;

    // TODO if includes -> continue parsing
    // For now:
    // If this file is in another directory that's not a child of the one the main api.yaml file is,
    //  copy to a dist dir.

    return includeContents.toString();
  }
}