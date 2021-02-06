var table = function() {
    this.div_id = "table_id";
    var set_div_id = function(div_id) {
        this.div_id = div_id;
    };
    var load_config = function(config_path) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                config_loaded(this.responseText, div_id);
            } else {
                config_error_loading();
            }
        };
        xhr.open("GET", config_path, true);
        xhr.send();
    };
    var config_loaded = function(response, div_id) {
        var table_div = document.getElementById(div_id);
        var table_json = parse_response_to_json(response);
        table_div.innerHTML = make_table_code(table_json);
    };
    var config_error_loading = function() {
    };
    var parse_response_to_json = function(response) {
        return JSON.parse(response);
    };
    var make_table_code = function(table_json) {
        var rows_json = table_json.rows;
        var table_code = "<table>";
        for (row_index in rows_json) {
            table_code += make_row_code(rows_json[row_index], row_index);
        }
        table_code += "</table>";
        return table_code;
    };
    var make_row_code = function(row_json, row_index) {
        var row_code = "<tr>";
        for (cell_index in row_json) {
            row_code += make_cell_code(row_json[cell_index], row_index, cell_index, row_json.length);
        }
        row_code += "</tr>";
        return row_code;
    }
    var make_cell_code = function(cell_json, row_index, cell_index, number_of_cells) {
        var cell_code = "<td>";
        cell_code += cell_json;
        cell_code += "&nbsp;";
        cell_code += make_select_code(
            div_id+"_select_row_"+row_index+" "+div_id+"_select_col_"+cell_index,
            div_id+"_select_"+row_index+"_"+cell_index,
            number_of_cells
        );
        cell_code += "</td>";
        return cell_code;
    }
    var make_select_code = function(select_class, select_id, number_of_options) {
        var select_code = "<select class='"+select_class+"' id='"+select_id+"'>";
        select_code += "<option></option>";
        for (var number_of_option = nuber_of_options; 0 < number_of_option; number_of_option--) {
            var option_code = "<option value='"+number_of_option+"'>"+number_of_option+"</option>";
            select_code += option_code;
        }
        select_code += "</select>";
        return select_code;
    };

    return {
        draw: function(config_path, div_id) {
            set_div_id(div_id);
            load_config(config_path);
        }
    };
}();