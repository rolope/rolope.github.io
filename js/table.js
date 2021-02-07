var table = function(variable_name) {
    this.variable_name = variable_name;
    this.div_id = "table_id";
    var set_div_id = function(div_id) {
        this.div_id = div_id;
    };
    var columns = [];

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
        columns = table_json.columns;
        table_div.innerHTML = make_table_code(table_json);
    };
    var config_error_loading = function() {
    };

    var parse_response_to_json = function(response) {
        return JSON.parse(response);
    };

    var make_table_code = function(table_json) {
        var rows_json = table_json.rows;
        var table_code = "";
        for (row_index in rows_json) {
            table_code += make_row_code(rows_json[row_index], row_index);
        }
        return table_code;
    };
    var make_row_code = function(row_json, row_index) {
        var row_code = "<div class='row border-bottom border-primary p-3'>";
        row_code += "<div class='col fw-bold'>"+(parseInt(row_index) + 1)+"</div>";
        for (cell_index in row_json) {
            row_code += make_cell_code(row_json[cell_index], row_index, cell_index, row_json.length);
        }
        row_code += "</div>";
        return row_code;
    }
    var make_cell_code = function(cell_json, row_index, cell_index, number_of_cells) {
        var cell_code = "<div class='col'><div class='row'>";
        cell_code += "<div class='col'>"+cell_json+"</div>";
        cell_code += "<div class='col text-start'>";
        cell_code += make_select_code(
            row_index,
            cell_index,
            number_of_cells
        );
        cell_code += "</div>";
        cell_code += "</div></div>";
        return cell_code;
    }
    var make_select_code = function(row_index, cell_index, number_of_options) {
        var row_class = make_row_class(row_index);
        var cell_class = make_cell_class(cell_index);
        var select_class = row_class+" "+cell_class;
        var select_id = make_select_id(row_index, cell_index);
        var select_code = "<select class='form_select "+select_class+"' id='"+select_id+"' onchange='"+variable_name+".avoid_duplicates("+row_index+", "+cell_index+");'>";
        select_code += "<option></option>";
        for (var number_of_option = number_of_options; 0 < number_of_option; number_of_option--) {
            var option_code = "<option value='"+number_of_option+"'>"+number_of_option+"</option>";
            select_code += option_code;
        }
        select_code += "</select>";
        return select_code;
    };

    var make_row_class = function(row_index) {
        return div_id+"_select_row_"+row_index;
    };
    var make_cell_class = function(cell_index) {
        return div_id+"_select_cell_"+cell_index;
    };
    var make_select_id = function(row_index, cell_index) {
        return div_id+"_select_"+row_index+"_"+cell_index;
    };

    var avoid_duplicates = function(row_index, cell_index) {
        var row_class = make_row_class(row_index);
        var row_selects = document.getElementsByClassName(row_class);
        var select_id = make_select_id(row_index, cell_index);
        var original_select = document.getElementById(select_id);
        if (original_select.selectedIndex != 0) {
            for (row_select_index in row_selects) {
                var a_select = row_selects[row_select_index];
                if (a_select.id != original_select.id) {
                    if (a_select.selectedIndex == original_select.selectedIndex) {
                        a_select.selectedIndex = 0;
                        break;
                    }
                }
            }
        }
    };

    var sum_columns = function() {
        var sums = [];
        for (cell_index in columns) {
            var cell_class = make_cell_class(cell_index);
            var selects = document.getElementsByClassName(cell_class);
            var sum = 0;
            for (select_index in selects) {
                var a_select = selects[select_index];
                var selected_value = a_select.value;
                var value = parseInt(selected_value);
                if (!isNaN(value)) {
                    sum += value;
                }
            }
            sums[cell_index] = sum;
        }
        return sums;
    };
    var sort_sums_indices = function(sums) {
        var length = sums.length;
        var sorted = [];
        for (var index = 0; index < length; index++) {
            sorted[index] = index;
        }
        sorted.sort(
            function(x, y) {
                return sums[x] < sums[y] ? 1 : sums[y] < sums[x] ? -1 : 0;
            }
        );
        return sorted;
    }
    var evaluate = function() {
        var sums = sum_columns();
        var sorted_sums_indices = sort_sums_indices(sums);
        var length = sorted_sums_indices.length;
        var evaluation = "";
        for (var index = 0; index < length; index++) {
            var column_index = sorted_sums_indices[index];
            evaluation += make_evaluation_line_code(column_index, index);
        }
        return evaluation;
    };
    var make_evaluation_line_code = function(column_index, index) {
        var is_main_result = index == 0;
        var tag = "h4";
        var explanation = "Tu elemento "+(index + 1)+" es";
        if (is_main_result) {
            tag = "h2";
            explanation = "Tu elemento principal es";
        }
        var line_code = "<"+tag+">";
        line_code += explanation+" <b>"+columns[column_index]+"</b>";
        line_code += "</"+tag+">";
        return line_code;
    };
    var display_evaluation = function(display_id) {
        var display = document.getElementById(display_id);
        var evaluation = evaluate();
        display.innerHTML = evaluation;
    }

    return {
        draw: function(config_path, div_id) {
            set_div_id(div_id);
            load_config(config_path);
        },
        avoid_duplicates: avoid_duplicates,
        display_evaluation: display_evaluation
    };
};