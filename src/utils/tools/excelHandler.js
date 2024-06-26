import {utils, writeFile} from 'xlsx'

function auto_width (ws, data) {
    /*set worksheet max width per col*/
    const colWidth = data.map(row => row.map(val => {
        /*if null/undefined*/
        if (val == null) {
            return { 'wch': 10 }
        }
        /*if chinese*/
        else if (val.toString().charCodeAt(0) > 255) {
            return { 'wch': val.toString().length * 2 }
        } else {
            return { 'wch': val.toString().length }
        }
    }))
    /*start in the first row*/
    let result = colWidth[0]
    for (let i = 1; i < colWidth.length; i++) {
        for (let j = 0; j < colWidth[i].length; j++) {
            if (result[j]['wch'] < colWidth[i][j]['wch']) {
                result[j]['wch'] = colWidth[i][j]['wch']
            }
        }
    }
    ws['!cols'] = result
}

function json_to_array (key, jsonData) {
    return jsonData.map(v => key.map(j => { return v[j] }))
}

export const export_json_to_excel = ({ data, key, title, filename, autoWidth }) => {
    const wb = utils.book_new()

    data.unshift(title)
    const ws = utils.json_to_sheet(data, { header: key, skipHeader: true })
    if (autoWidth) {
        const arr = json_to_array(key, data)
        auto_width(ws, arr)
    }
    utils.book_append_sheet(wb, ws, filename)
    writeFile(wb, filename + '.xlsx')
}
