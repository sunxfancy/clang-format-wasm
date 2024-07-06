#!/usr/bin/env node
var fs = require('fs');

console.log(JSON.stringify(parse_documentation('ClangFormatStyleOptions.rst')));

function parse_documentation(file) {
    var docs = {};
    var result = fs.readFileSync(file, { encoding: 'utf8' });

    var start_based_on = result.indexOf('**BasedOnStyle** (``string``)');
    var end_based_on = result.indexOf('.. START_FORMAT_STYLE_OPTIONS');
    var based_on = result.substring(start_based_on, end_based_on);

    var start_delimiter = '.. START_FORMAT_STYLE_OPTIONS';
    var end_delimiter = '.. END_FORMAT_STYLE_OPTIONS';
    var start = result.indexOf(start_delimiter);
    var end = result.indexOf(end_delimiter);
    result = based_on + result.substring(start + start_delimiter.length, end);

    var splits = result.split(/\*\*(\w*)\*\* \(``([^`]*)``\)/).slice(1);

    for (var i = 0; i < splits.length; i += 3) {
        var name = splits[i];
        var type = splits[i + 1];
        var doc = splits[i + 2];

        docs[name] = {
            type: type,
            // doc: marked(doc)
        };
        var recognised_types = [
            'bool',
            'unsigned',
            'int',
            'std::string',
            'std::vector<std::string>'
        ];
        if (recognised_types.indexOf(type) === -1) {
            docs[name].options = get_select_options(name, doc);
        }
    }

    return docs;
}

function get_select_options(name, doc) {
    var start_delimiter = '  Possible values:\n\n';
    var start_delimiter_nested = '  Nested configuration flags:\n\n'
    var start = doc.search(start_delimiter);
    var search_area = doc.substring(start + start_delimiter.length);
    var split_jump = 2

    var splits;
    if (name === 'BasedOnStyle') {
        splits = search_area.split(/  \* ``(\w*)``\n/).slice(1);
    }
    else if (name === 'BraceWrapping') {
        var start_nested = doc.search(start_delimiter_nested);
        var search_area_nested = doc.substring(start_nested + start_delimiter_nested.length);
        splits = search_area_nested.split(/  \* ``(\w*) (\w*)`` .*\n/).slice(2);
        split_jump = 3
    } else
        splits = search_area.split(/  \* ``\w*`` \(in configuration: ``(\w*)``\)\n/).slice(1);

    var result = [];

    for (var i = 0; i < splits.length; i += split_jump)
        result.push(splits[i]);

    return result;
}
