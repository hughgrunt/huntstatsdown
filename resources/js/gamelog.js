const GAMELOG =
{
  MARKER:
  {
    LOG_STARTED   : "Log Started at",
    LOADED_MENU   : "============================ Loading level menu ============================",
    LOADED_LEVEL  : "============================ PrepareLevel",
    CLOSED_SUMMARY: "[UIFramework] unloading flashplayer for layout 'mission_end_rewards'"
  },
  /*
  <13:30:13> ============================ PrepareLevel
  <13:31:13> ============================ Loading level menu ============================
  <13:32:13> [UIFramework] unloading flashplayer for layout 'mission_end_rewards'
  */
  READ_LOG: function (file_text) //array of lines
  {
    let AddDayCorrection = false;
    let utc = null;
    let gamelog_infos = {};
    for (let line in file_text)
    {
      let c_line = file_text[line];
      c_line = c_line.replace("  ", " ");

      if (c_line.includes(this.MARKER.LOG_STARTED))
      {
        utc = this.PARSE_UTC(c_line);
      }
      if (!utc){continue;}
      else if (c_line.includes(this.MARKER.LOADED_LEVEL))
      {
        gamelog_infos.start = this.PARSE_LINETIME(c_line, utc.date, utc.utc);
        gamelog_infos.level  = this.PARSE_LEVEL(c_line);
      }
      else if (c_line.includes(this.MARKER.LOADED_MENU))
      {
        gamelog_infos.end = this.PARSE_LINETIME(c_line, utc.date, utc.utc);
      }
      else if (c_line.includes(this.MARKER.CLOSED_SUMMARY))
      {
        gamelog_infos.closed_summary = this.PARSE_LINETIME(c_line, utc.date, utc.utc);
      }

      if (c_line.startsWith("<"))
      {
        let hour = parseInt(c_line.substring(1,3), 10);
        if (!AddDayCorrection)
        {
          if (hour == 23){AddDayCorrection = true; }
        }
        else if (AddDayCorrection)
        {
          if (hour == 0){AddDayCorrection = false;utc.utc += 24;}
        }
      }
    }
    return gamelog_infos;
  },
  PARSE_LEVEL : function (line)
  {
    let info = line.split(" ");
    let name = info[3];
    switch(name)
    {

      case "levels/cemetery": name = "Stillwater Bayou"; break;
      case "levels/creek": name = "DeSalle"; break;
      case "levels/civilwar": name = "Lawson Delta"; break;
      default: name = "lvl not found"; break;
    }
    return name;
  },
  PARSE_UTC : function (line) //returns .utc = number; .date = date
  {
    let line_infos = line.split(" ");

    let utc = line_infos[8];
    utc = utc.replace("(", "");
    utc = utc.replace(")", "");
    utc = parseInt(utc.replace("UTC", ""), 10);

    let y = parseInt(line_infos[7], 10);
    let m = this.TRANSLATE_MONTH_NAMETONUMBER(line_infos[4]);
    let d = parseInt(line_infos[5], 10);

    let time = this.TRANSLATE_TIME(line_infos[6]);

    let start_date = new Date(y, m, d, time.hours, time.minutes, time.seconds);

    //start_date = this.ADD_HOURS(start_date, utc);
    let rtn = {};
    rtn.utc = utc;
    rtn.date = start_date;
    return rtn;
  },
  PARSE_LINETIME : function (line, base_date, utc)
  {
    let info = line.split(" ");
    let time = info[0];
    time = time.replace("<", "");
    time = time.replace(">", "");
    let t = this.TRANSLATE_TIME(time);
    base_date.setHours(t.hours);
    base_date.setMinutes(t.minutes);
    base_date.setSeconds(t.seconds);

    let nd = new Date(base_date.getTime());
    nd = this.ADD_HOURS(nd, utc);
    return nd;
  },
  TRANSLATE_TIME: function (time)
  {
    let infos = time.split(":");
    let hours = parseInt(infos[0], 10);
    let minutes = parseInt(infos[1], 10);
    let seconds = parseInt(infos[2], 10);
    return {"hours":hours ,"minutes":minutes, "seconds":seconds};
  },
  TRANSLATE_MONTH_NAMETONUMBER : function (month)
  {
    switch (month)
    {
      case "Jan": month = 0; break;
      case "Feb": month = 1; break;
      case "Mar": month = 2; break;
      case "Apr": month = 3; break;
      case "May": month = 4; break;
      case "Jun": month = 5; break;
      case "Jul": month = 6; break;
      case "Aug": month = 7; break;
      case "Sep": month = 8; break;
      case "Oct": month = 9; break;
      case "Nov": month = 10; break;
      case "Dec": month = 11; break;
    }
    return month
  },
  ADD_HOURS : function (date, hour)
  {
    let ms = date.getTime();
    ms += (hour * 3600000);
    return new Date(ms);
  }
};
