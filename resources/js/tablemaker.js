class TableMaker
{
  constructor(id, data)
  {
    this.data = data;
    this.filtered_indicies = [];

    this.data_row_start = 2;
    this.page = 1;
    this.max_per_page = 8;

    this.operator =
    {
      "equal"   : "==",
      "not"     : "!=",
      "lesser" : "<",
      "greater" : ">",
      "empty"   : '""',
      "notempty": '!"'
    }

    this.id = id || new Date().getTime();
    this.id_inforow = this.id + "inforow";
    this.id_pageselect = this.id + "pageselect";
    this.columns = [];
    this.TR_ONCLICK = function () {};
  }
  MakeTable(options)
  {
    if(!options){return "no options given"}
    let data = options.data || this.data;
    this.data = data;
    this.filtered_indicies = this.BuildAllDataIndices(this.data);
    this.all_data_indicies = this.filtered_indicies;

    this.BuildDataRowsByIndices.bind(this);
    this.DrawDataRows.bind(this);
    this.NavigatePage.bind(this);
    this.UpdateData.bind(this);
    this.BuildRowTotal.bind(this);
    //let bind_data_to_row = this.TR_ONCLICK.bind(data[index]);

    if (!data){return "no data given for tablemaker"};
    this.id = options.id || this.id;
    this.columns = options.columns;

    if (options.TR_ONCLICK){this.TR_ONCLICK = options.TR_ONCLICK;};

    let table = document.createElement('table');
    table.id = this.id;
    table.style.width = "100%";

    table.appendChild(this.BuildRowSearchInputs(this.columns));

    table.appendChild(this.BuildRowHeadings(this.columns ));
    table.appendChild(this.BuildRowTotal(this.columns, this.filtered_indicies));
    table.appendChild(this.BuildRowInfo(this.id_inforow, this.filtered_indicies, this.max_per_page)[0]);



    let datarows = this.BuildDataRowsByIndices(this.filtered_indicies);
    for (let d=0,dl=datarows.length;d<dl;d++)
    {
      table.appendChild(datarows[d]);
    }


    return table;
  }
  BuildRowSearchInputs(columns)
  {
    let row = document.createElement("tr");
    for(let c=0,cl=columns.length;c<cl;c++)
    {
      let cell = document.createElement("td");
      cell.style.textAlign = "center";
      let input = document.createElement("input");
      input.size = columns[c].inputFilterSize || 8;
      input.style.textAlign = "center";

      let bind_search = this.Search.bind(this);
      input.addEventListener("keyup", function() {bind_search();});

      cell.appendChild(input);
      row.appendChild(cell);
    }
    return row;
  }
  BuildRowHeadings(columns)
  {
    let row = document.createElement("tr");
    for(let c=0,cl=columns.length;c<cl;c++)
    {
      let cell = document.createElement("th");
      cell.innerHTML = columns[c].name;
      row.appendChild(cell);
    }
    return row;
  }
  BuildRowInfo(id, data_indices, max_per_page)
  {
    let page_count = 1;
    let correction = 0;
    let row = document.createElement("tr");
    let cell = document.createElement("td");
    let page_select = document.createElement("SELECT");
    let bind_navigation = this.NavigatePage.bind(this);
    page_select.onchange = function (){bind_navigation(this.value);}

    let option = document.createElement("option");
    option.text = "1";
    page_select.add(option);

    for (let d=0,dL=data_indices.length;d<dL;d++)
    {
      if (d+correction == max_per_page)
      {
        page_count++;
        correction -= max_per_page;
        let option = document.createElement("option");
        option.text = page_count;
        page_select.add(option);
      }
    }
    page_select.selectedIndex = this.page -1;
    cell.id = id;
    cell.colSpan = "1000";

    let div_info = document.createElement("span");
    let showing_from = 1 + ((this.page-1) * max_per_page);
    let showing_to = showing_from + (max_per_page-1);
    if (showing_to > data_indices.length){showing_to = data_indices.length;}
    div_info.innerHTML = showing_from + "-"+showing_to+"/"+data_indices.length + " = "+ ((data_indices.length / this.all_data_indicies.length)*100).toFixed(2) +"% (" + this.all_data_indicies.length+") total";

    cell.appendChild(page_select);
    cell.appendChild(div_info);

    row.appendChild(cell);
    return [row];
  }
  BuildRowTotal(columns, data_indices)
  {
    let row = document.createElement("tr");
    let totals = {};

    for (let d=0,dL=data_indices.length;d<dL;d++)
    {
      for(let c=0,cL=columns.length;c<cL;c++)
      {
        if (!columns[c].total_type){totals[columns[c].name] = "";continue;}
        if (columns[c].total_type == "sum")
        {

          if (!totals[columns[c].name]){totals[columns[c].name] = {"sum": 0};}
          totals[columns[c].name].sum += parseInt(this.data[data_indices[d]][columns[c].data_source], 10) || 0;
        }
      }
    }
    for (let total in totals)
    {
      let cell = document.createElement("td");
      if (totals[total].sum)
      {
        totals[total].average = totals[total].sum / data_indices.length;
        cell.innerHTML =   "="+totals[total].sum + "<br>~"+totals[total].average.toFixed(2);
      }
      cell.style.textAlign = "center";
      row.appendChild(cell);
    }
    return row;
  }
  NavigatePage(page)
  {
    this.page = page;
    this.DrawDataRows(true);
  }
  ClearDataRows(id, start_data_row, end_data_row)
  {
    let table = document.getElementById(id);
    let rows = table.getElementsByTagName("tr");
    let del_correction = 0;
    for (let r=start_data_row,rL=rows.length;r<rL;r++)
    {
      table.deleteRow(r+del_correction);
      del_correction--;
    }
  }
  AppendRows(id, rows)
  {
    let table = document.getElementById(id);
    for (let r=0,rL=rows.length;r<rL;r++)
    {
      table.appendChild(rows[r]);
    }
  }
  AppendRow(id, row)
  {
    let table = document.getElementById(id);
    table.appendChild(row);
  }
  BuildDataRowsByIndices(indices)
  {
    let columns = this.columns;
    let data = this.data;
    let rows = [];
    for(let i=0,iL=indices.length;i<iL;i++)
    {
      if (i > (this.max_per_page -1))
      {
        break;
      }

      let page_corr = ((this.page-1) * (this.max_per_page));
      let indices_index = i + page_corr;
      if (indices_index > indices.length-1)
      {
        break;
      }
      let index = indices[indices_index];


      let row = document.createElement("tr");
      row.id = data[index].id;
      let bind_data_to_row = this.TR_ONCLICK.bind(data[index]);
      row.ondblclick = function ()
      {
        bind_data_to_row();
        let trs = this.parentElement.children;
        for(let t=0,tL=trs.length;t<tL;t++)
        {
          trs[t].classList.remove("selected");
        }
        this.classList.add("selected");
      };
      for (let c=0,cl=columns.length;c<cl;c++)
      {
        let cell = document.createElement("td");
        cell.data_index = index;
        cell.instance = this;
        if (columns[c].fontSize){cell.style.fontSize = columns[c].fontSize;}
        cell.style.textAlign = columns[c].textAlign || "center";
        cell.innerHTML = data[index][columns[c].data_source];
        if (!data[index][columns[c].data_source])
        {
          cell.innerHTML = "";
        }
        if (Array.isArray(data[index][columns[c].data_source]))
        {
          cell.innerHTML = data[index][columns[c].data_source].join(", ");
        }
        if (columns[c].onclick)
        {
          let onclick_func = columns[c].onclick;
          cell.onclick = function(){onclick_func(this)};
        }
        row.appendChild(cell);
      }
      rows.push(row);
    }
    return rows;
  }
  BuildAllDataIndices(data, filter)
  {
    let filtered_data = [];
    for (let d=0,dL=data.length;d<dL;d++)
    {
        filtered_data.push(d);
    }
    return filtered_data;
  }
  GetColumnNames(data, max_loops)
  {
    let column_names = [];
    if (!max_loops){max_loops = data.length;}
    if (max_loops > data.length){max_loops = data.length}
    for(let d=0;d<max_loops;d++)
    {
      for (let prop in data[d])
      {
        if (!column_names.includes(prop)){column_names.push(prop);}
      }
    }
    return column_names;
  }
  GetSearchInputs()
  {
    let search_requests = {};
    let NoRequests = true;
    let table = document.getElementById(this.id);
    let inputs = table.getElementsByTagName("input");
    for(let i=0,il=inputs.length;i<il;i++)
    {
      let v = inputs[i].value;
      if (v.length > 0){NoRequests = false;}
      if (v){search_requests[this.columns[i].data_source] = inputs[i].value;}
    }
    if (NoRequests){search_requests = false;}
    return search_requests;
  }
  Search()
  {
    let search_jobs = this.GetSearchInputs();
    let matched_data_indices = [];
    this.page = 1;

    if (!search_jobs)
    {
      this.filtered_indicies = this.all_data_indicies;
    }
    else
    {
      for (let d=0,dL=this.data.length;d<dL;d++)
      {
        let AddMe = false;
        let AnyFalse = false;
        for (let search_column in search_jobs)
        {
          let ReturnBecauseOnlyOperator = false;
          AddMe = false;
          if (AnyFalse){continue;}

          for (let operator in this.operator)
          {
            if (operator.length > 1)
            {
              if(search_jobs[search_column].startsWith(this.operator[operator].substring(0, search_jobs[search_column].length)))
              {
                ReturnBecauseOnlyOperator = true;
              }
            }
          }



          if (search_jobs[search_column].startsWith(this.operator.lesser) || search_jobs[search_column].startsWith(this.operator.greater))
          {
            ReturnBecauseOnlyOperator = false;
            let data_number = parseInt(this.data[d][search_column], 10) || 0;
            if (search_jobs[search_column].startsWith(this.operator.lesser))
            {
              if (data_number < (parseInt(search_jobs[search_column].substring(1), 10) || 1))
              {AddMe = true;continue; }
            }
            else if (search_jobs[search_column].startsWith(this.operator.greater))
            {
              if (data_number > (parseInt(search_jobs[search_column].substring(1), 10) ||0))
              {AddMe = true;continue; }
            }
          }

          if (search_jobs[search_column].startsWith(this.operator.equal) && search_jobs[search_column].length > this.operator.equal.length)
          {
            ReturnBecauseOnlyOperator = false;
            if (this.data[d][search_column].toString() == search_jobs[search_column].substring(this.operator.equal.length))
            {AddMe = true; continue;}
          }

          if (search_jobs[search_column].startsWith(this.operator.not) && search_jobs[search_column].length > this.operator.not.length)
          {
            ReturnBecauseOnlyOperator = false;
            if (!this.data[d][search_column].toString().includes(search_jobs[search_column].substring(this.operator.not.length)))
            {AddMe = true;continue;}
          }

          if (search_jobs[search_column].startsWith(this.operator.empty))
          {
            ReturnBecauseOnlyOperator = false;
            if (!this.data[d][search_column]){AddMe = true;continue;}
          }

          if (search_jobs[search_column].startsWith(this.operator.notempty))
          {
            ReturnBecauseOnlyOperator = false;
            if (this.data[d][search_column]){AddMe = true;continue;}
          }

          if (ReturnBecauseOnlyOperator){return;}
          if (!this.data[d][search_column]){AddMe = false;break;}

          if (this.data[d][search_column].toString().includes(search_jobs[search_column]))
          {AddMe = true;continue;}
          AnyFalse = true;
        }

        if (AddMe)
        {
          matched_data_indices.push(d);
        }
      }
      this.filtered_indicies = matched_data_indices;

    }
    this.DrawDataRows();
  }
  DrawDataRows(skip_totals)
  {
    let start_row_clear = this.data_row_start;
    if (skip_totals){start_row_clear++;}
    this.ClearDataRows(this.id, start_row_clear, (this.data_row_start+this.max_per_page));
    let table = document.getElementById(this.id);


    if (!skip_totals)
    {
      this.AppendRow(this.id, this.BuildRowTotal(this.columns, this.filtered_indicies));
    }

    this.AppendRows(this.id, this.BuildRowInfo(this.id_inforow, this.filtered_indicies, this.max_per_page));

    let pageselect = document.getElementById(this.id_pageselect);
    this.AppendRows(this.id, this.BuildDataRowsByIndices(this.filtered_indicies));

  }
  GetValueByProp(objArr, prop)
  {
    let arr = [];
    for(let a=0,aL=objArr.length;a<aL;a++)
    {
      arr.push(objArr[a][prop]);
    }
    return arr;
  }
  UpdateData(data)
  {
    this.data = data;
    this.all_data_indicies = this.BuildAllDataIndices(this.data);
    this.Search();
  }
}
