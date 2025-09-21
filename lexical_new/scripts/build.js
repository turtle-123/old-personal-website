/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const rollup = require('rollup');
const fs = require('fs-extra');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const babel = require('@rollup/plugin-babel').default;
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const json = require('@rollup/plugin-json');
const extractErrorCodes = require('./error-codes/extract-errors');
const alias = require('@rollup/plugin-alias');
const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const {exec} = require('child-process-promise');

const OUTPUT_DIR = path.resolve(__dirname,'..','..','frontend_javascript','src','js','lexical-folder');

const license = ` * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.`;

const isProduction = argv.prod;
const isRelease = argv.release;
const isWWW = argv.www;
const extractCodes = argv.codes;

const closureOptions = {
  apply_input_source_maps: false,
  assume_function_wrapper: true,
  compilation_level: 'SIMPLE',
  inject_libraries: false,
  language_in: 'ECMASCRIPT_2019',
  language_out: 'ECMASCRIPT_2019',
  process_common_js_modules: false,
  rewrite_polyfills: false,
  use_types_for_optimization: false,
  warning_level: 'QUIET',
};

const wwwMappings = {
  '@lexical/clipboard': 'LexicalClipboard',
  '@lexical/code': 'LexicalCode',
  '@lexical/dragon': 'LexicalDragon',
  '@lexical/file': 'LexicalFile',
  '@lexical/hashtag': 'LexicalHashtag',
  '@lexical/headless': 'LexicalHeadless',
  '@lexical/history': 'LexicalHistory',
  '@lexical/html': 'LexicalHtml',
  '@lexical/link': 'LexicalLink',
  '@lexical/list': 'LexicalList',
  '@lexical/mark': 'LexicalMark',
  '@lexical/markdown': 'LexicalMarkdown',
  '@lexical/offset': 'LexicalOffset',
  '@lexical/overflow': 'LexicalOverflow',
  '@lexical/plain-text': 'LexicalPlainText',
  '@lexical/rich-text': 'LexicalRichText',
  '@lexical/selection': 'LexicalSelection',
  '@lexical/table': 'LexicalTable',
  '@lexical/text': 'LexicalText',
  '@lexical/utils': 'LexicalUtils',
  '@lexical/yjs': 'LexicalYjs',
  'lexical': 'Lexical',
  'prismjs/components/prism-core': 'prismjs',
  'react-dom': 'ReactDOMComet',

  '@lexical/decorators': 'LexicalDecorators',
  '@lexical/custom-code': 'LexicalCustomCode',
  '@lexical/aside': 'LexicalAside',
  '@lexical/details': 'LexicalDetails',
  '@lexical/toolbar': 'LexicalToolbar',
  '@lexical/shared': 'LexicalShared',
  '@lexical/math': 'LexicalMath',
  '@lexical/column': 'LexicalColumn',
};



const externals = [
  'lexical',
  'prismjs/components/prism-core',
  'prismjs/components/prism-clike',
  'prismjs/components/prism-javascript',
  'prismjs/components/prism-markup',
  'prismjs/components/prism-markdown',
  'prismjs/components/prism-c',
  'prismjs/components/prism-css',
  'prismjs/components/prism-objectivec',
  'prismjs/components/prism-sql',
  'prismjs/components/prism-python',
  'prismjs/components/prism-rust',
  'prismjs/components/prism-swift',
  'prismjs/components/prism-typescript',
  'prismjs/components/prism-java',
  'prismjs/components/prism-cpp',
  '@lexical/list',
  '@lexical/table',
  '@lexical/file',
  '@lexical/clipboard',
  '@lexical/hashtag',
  '@lexical/headless',
  '@lexical/html',
  '@lexical/history',
  '@lexical/selection',
  '@lexical/text',
  '@lexical/offset',
  '@lexical/utils',
  '@lexical/code',
  '@lexical/yjs',
  '@lexical/plain-text',
  '@lexical/rich-text',
  '@lexical/mark',
  '@lexical/dragon',
  '@lexical/overflow',
  '@lexical/link',
  '@lexical/markdown',
  '@lexical/math',

  '@lexical/decorators',
  '@lexical/custom-code',
  '@lexical/aside',
  '@lexical/details',
  '@lexical/shared',
  '@lexical/toolbar',
  '@lexical/column',

  'katex',
  '@floating-ui/dom',
  'react-dom',
  'react',
  'yjs',
  'y-websocket',
  "personal-website-shared",
  ...Object.values(wwwMappings),
];

const errorCodeOpts = {
  errorMapFilePath: 'scripts/error-codes/codes.json',
};

const findAndRecordErrorCodes = extractErrorCodes(errorCodeOpts);

const strictWWWMappings = {};

// Add quotes around mappings to make them more strict.
Object.keys(wwwMappings).forEach((mapping) => {
  strictWWWMappings[`'${mapping}'`] = `'${wwwMappings[mapping]}'`;
});

async function build(name, inputFile, outputPath, outputFile, isProd) {
  const inputOptions = {
    external(modulePath, src) {
      return externals.includes(modulePath);
    },
    input: inputFile,
    onwarn(warning) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        // Ignored
      } else if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
        // Important, but not enough to stop the build
        console.error();
        console.error(warning.message || warning);
        console.error();
      } else if (typeof warning.code === 'string') {
        console.error(warning);
        // This is a warning coming from Rollup itself.
        // These tend to be important (e.g. clashes in namespaced exports)
        // so we'll fail the build on any of them.
        console.error();
        console.error(warning.message || warning);
        console.error();
        process.exit(1);
      } else {
        // The warning is from one of the plugins.
        // Maybe it's not important, so just print it.
        console.warn(warning.message || warning);
      }
    },
    plugins: [
      alias({
        entries: [
          {find: 'shared', replacement: path.resolve('packages/shared/src')},
        ],
      }),
      // Extract error codes from invariant() messages into a file.
      {
        transform(source) {
          // eslint-disable-next-line no-unused-expressions
          extractCodes && findAndRecordErrorCodes(source);
          return source;
        },
      },
      nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        configFile: false,
        exclude: '/**/node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        plugins: [
          [
            require('./error-codes/transform-error-messages'),
            {noMinify: !isProd},
          ],
          '@babel/plugin-transform-optional-catch-binding',
        ],
        presets: [
          [
            '@babel/preset-typescript',
            {
              tsconfig: path.resolve('./tsconfig.build.json'),
            },
          ],
          '@babel/preset-react',
        ],
      }),
      {
        resolveId(importee, importer) {
          if (importee === 'formatProdErrorMessage') {
            return path.resolve(
              './scripts/error-codes/formatProdErrorMessage.js',
            );
          }
        },
      },
      commonjs(),
      json(),
      replace(
        Object.assign(
          {
            __DEV__: isProd ? 'false' : 'true',
            delimiters: ['', ''],
            preventAssignment: true,
          },
          isWWW && strictWWWMappings,
        ),
      ),
      isProd && compiler(closureOptions),
      {
        renderChunk(source) {
          // Assets pipeline might use "export" word in the beginning of the line
          // as a dependency, avoiding it with empty comment in front
          const patchedSource = isWWW
            ? source.replace(/^(export(?!s))/gm, '/**/$1')
            : source;
          return `${getComment()}\n${patchedSource}`;
        },
      },
    ],
    // This ensures PrismJS imports get included in the bundle
    treeshake: isWWW || name !== 'Lexical Code' ? 'smallest' : undefined,
  };
  const outputOptions = {
    esModule: false,
    exports: 'auto',
    externalLiveBindings: false,
    file: outputFile,
    format: 'es', // change between es and cjs modules
    freeze: false,
    interop: false,
  };
  const result = await rollup.rollup(inputOptions);
  await result.write(outputOptions);
}

function getComment() {
  const lines = ['/**', license];
  if (isWWW) {
    lines.push(
      '*',
      '* @fullSyntaxTransform',
      '* @generated',
      '* @noflow',
      '* @nolint',
      '* @oncall lexical_web_text_editor',
      '* @preserve-invariant-messages',
      '* @preserve-whitespace',
      '* @preventMunge',
    );
  }
  lines.push(' */');
  return lines.join('\n');
}

function getFileName(fileName, isProd) {
  if (isWWW || isRelease) {
    return `${fileName}.${isProd ? 'prod' : 'dev'}.js`;
  }
  return `${fileName}.js`;
}

const packages = [
  {
    modules: [
      {
        outputFileName: 'Lexical',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Core',
    outputPath: path.resolve(OUTPUT_DIR,'lexical'),
    packageName: 'lexical',
    sourcePath: './packages/lexical/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalList',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical List',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-list'),
    packageName: 'lexical-list',
    sourcePath: './packages/lexical-list/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalTable',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Table',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-table'),
    packageName: 'lexical-table',
    sourcePath: './packages/lexical-table/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalFile',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical File',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-file'),
    packageName: 'lexical-file',
    sourcePath: './packages/lexical-file/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalClipboard',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical File',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-clipboard'),
    packageName: 'lexical-clipboard',
    sourcePath: './packages/lexical-clipboard/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalHashtag',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Hashtag',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-hashtag'),
    packageName: 'lexical-hashtag',
    sourcePath: './packages/lexical-hashtag/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalHistory',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical History',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-history'),
    packageName: 'lexical-history',
    sourcePath: './packages/lexical-history/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalSelection',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Selection',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-selection'),
    packageName: 'lexical-selection',
    sourcePath: './packages/lexical-selection/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalText',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Text',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-text'),
    packageName: 'lexical-text',
    sourcePath: './packages/lexical-text/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalOffset',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Offset',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-offset'),
    packageName: 'lexical-offset',
    sourcePath: './packages/lexical-offset/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalUtils',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Utils',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-utils'),
    packageName: 'lexical-utils',
    sourcePath: './packages/lexical-utils/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalCode',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Code',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-code'),
    packageName: 'lexical-code',
    sourcePath: './packages/lexical-code/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalDragon',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Dragon',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-dragon'),
    packageName: 'lexical-dragon',
    sourcePath: './packages/lexical-dragon/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalLink',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Link',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-link'),
    packageName: 'lexical-link',
    sourcePath: './packages/lexical-link/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalOverflow',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Overflow',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-overflow'),
    packageName: 'lexical-overflow',
    sourcePath: './packages/lexical-overflow/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalPlainText',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Plain Text',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-plain-text'),
    packageName: 'lexical-plain-text',
    sourcePath: './packages/lexical-plain-text/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalRichText',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Rich Text',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-rich-text'),
    packageName: 'lexical-rich-text',
    sourcePath: './packages/lexical-rich-text/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalMarkdown',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Markdown',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-markdown'),
    packageName: 'lexical-markdown',
    sourcePath: './packages/lexical-markdown/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalHeadless',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Headless',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-headless'),
    packageName: 'lexical-headless',
    sourcePath: './packages/lexical-headless/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalHtml',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical HTML',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-html'),
    packageName: 'lexical-html',
    sourcePath: './packages/lexical-html/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalMark',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Mark',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-mark'),
    packageName: 'lexical-mark',
    sourcePath: './packages/lexical-mark/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalYjs',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Yjs',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-yjs'),
    packageName: 'lexical-yjs',
    sourcePath: './packages/lexical-yjs/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalDecorators',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Implementation',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-decorators'),
    packageName: 'lexical-decorators',
    sourcePath: './packages/lexical-decorators/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalAside',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Aside',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-aside'),
    packageName: 'lexical-aside',
    sourcePath: './packages/lexical-aside/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalToolbar',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Toolbar',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-toolbar'),
    packageName: 'lexical-toolbar',
    sourcePath: './packages/lexical-toolbar/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalShared',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Shared',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-shared'),
    packageName: 'lexical-shared',
    sourcePath: './packages/lexical-shared/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalDetails',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Details',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-details'),
    packageName: 'lexical-details',
    sourcePath: './packages/lexical-details/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalMath',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Math',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-math'),
    packageName: 'lexical-math',
    sourcePath: './packages/lexical-math/src/',
  },
  {
    modules: [
      {
        outputFileName: 'LexicalColumn',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Lexical Column',
    outputPath: path.resolve(OUTPUT_DIR,'lexical-column'),
    packageName: 'lexical-column',
    sourcePath: './packages/lexical-column/src/',
  },
];

async function buildTSDeclarationFiles(packageName, outputPath) {
  await exec('tsc -p ./tsconfig.build.json');
}

async function moveTSDeclarationFilesIntoDist(packageName, outputPath) {
  await fs.copy(`./.ts-temp/${packageName}/src`, outputPath);
}

function buildForkModule(outputPath, outputFileName) {
  const lines = [
    getComment(),
    `'use strict'`,
    `const ${outputFileName} = process.env.NODE_ENV === 'development' ? require('./${outputFileName}.dev.js') : require('./${outputFileName}.prod.js')`,
    `module.exports = ${outputFileName};`,
  ];
  const fileContent = lines.join('\n');
  fs.outputFileSync(
    path.resolve(path.join(`${outputPath}${outputFileName}.js`)),
    fileContent,
  );
}

async function buildAll() {
  if (!isWWW && (isRelease || isProduction)) {
    await buildTSDeclarationFiles();
  }

  for (const pkg of packages) {
    const {name, sourcePath, outputPath, packageName, modules} = pkg;

    for (const module of modules) {
      const {sourceFileName, outputFileName} = module;
      let inputFile = path.resolve(path.join(`${sourcePath}${sourceFileName}`));

      await build(
        `${name}${module.name ? '-' + module.name : ''}`,
        inputFile,
        outputPath,
        path.resolve(
          path.join(
            `${outputPath}${getFileName(outputFileName, isProduction)}`,
          ),
        ),
        isProduction,
      );

      if (isRelease) {
        await build(
          name,
          inputFile,
          outputPath,
          path.resolve(
            path.join(`${outputPath}${getFileName(outputFileName, false)}`),
          ),
          false,
        );
        buildForkModule(outputPath, outputFileName);
      }
    }

    if (!isWWW && (isRelease || isProduction)) {
      await moveTSDeclarationFilesIntoDist(packageName, outputPath);
    }
  }
}

buildAll()
.then(() => {
  return fs.promises.readdir(OUTPUT_DIR);
})
.then(async (files) => {
  const arr = [
    {from:'lexical',to:'./lexicalLexical.js'},
    {from:'@lexical/clipboard',to:'./lexical-clipboardLexicalClipboard.js' },
    {from:'@lexical/code',to:'./lexical-codeLexicalCode.js'},
    {from:'@lexical/dragon',to:'./lexical-dragonLexicalDragon.js'},
    {from:'@lexical/file',to:'./lexical-fileLexicalFile.js'},
    {from:'@lexical/hashtag',to:'./lexical-hashtagLexicalHashtag.js'},
    {from:'@lexical/headless',to:'./lexical-headlessLexicalHeadless.js'},
    {from:'@lexical/history',to:'./lexical-historyLexicalHistory.js'},
    {from:'@lexical/link',to:'./lexical-linkLexicalLink.js'},
    {from:'@lexical/list',to:'./lexical-listLexicalList.js'},
    {from:'@lexical/markdown',to:'./lexical-markdownLexicalMarkdown.js'},
    {from:'@lexical/offset',to:'./lexical-offsetLexicalOffset.js'},
    {from:'@lexical/plain-text',to:'./lexical-plain-textLexicalPlainText.js'},
    {from:'@lexical/rich-text',to:'./lexical-rich-textLexicalRichText.js'},
    {from:'@lexical/selection',to:'./lexical-selectionLexicalSelection.js'},
    {from:'@lexical/table',to:'./lexical-tableLexicalTable.js'},
    {from:'@lexical/text',to:'./lexical-textLexicalText.js'},
    {from:'@lexical/utils',to:'./lexical-utilsLexicalUtils.js'},
    {from:'@lexical/html',to:'./lexical-htmlLexicalHtml.js'},
    {from: '@lexical/mark', to: './lexical-markLexicalMark'},

    {from: '@lexical/decorators',to:'./lexical-decoratorsLexicalDecorators.js'},
    {from: '@lexical/aside',to:'./lexical-asideLexicalAside.js'},
    {from: '@lexical/details',to:'./lexical-detailsLexicalDetails.js'},
    {from: '@lexical/toolbar',to:'./lexical-toolbarLexicalToolbar.js'},
    {from: '@lexical/shared',to:'./lexical-sharedLexicalShared.js'},
    {from: '@lexical/math',to:'./lexical-mathLexicalMath.js'},
    {from: '@lexical/overflow',to:'./lexical-overflowLexicalOverflow.js'},
    {from: '@lexical/column',to:'./lexical-columnLexicalColumn.js'},
  ];
  for (let file of files) {
    var fileContents = await fs.promises.readFile(path.resolve(OUTPUT_DIR,file),{encoding:'utf-8'});
    for (let obj of arr) {
      while (fileContents.includes(`from '${obj.from}'`)) {
        fileContents = fileContents.replace(`from '${obj.from}'`,`from '${obj.to}'`);
      }
    }
    await fs.promises.writeFile(path.resolve(OUTPUT_DIR,file),fileContents);
  }
})
