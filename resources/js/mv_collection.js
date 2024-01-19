function TranslateDate (date)
{
  let dt = {};
  dt.year = date.getFullYear();
  dt.month = ((date.getMonth() + 1) <10?"0":"") + (date.getMonth()+1);
  dt.day = (date.getDate() <10?"0":"") + date.getDate();

  dt.hours = (date.getHours()<10?"0":"")+date.getHours();
  dt.minutes = (date.getMinutes()<10?"0":"")+date.getMinutes();
  dt.seconds = (date.getSeconds()<10?"0":"")+date.getSeconds();

  dt.date = dt.day+"."+dt.month+"."+dt.year;
  dt.time = dt.hours+":"+dt.minutes;
  return dt;
}

function TranslateEvent(e)
{
  let xy = 32;
  let i_path = "./icons/";
  switch (e)
  {
    case "bountypickedup":e = BuildImage(i_path+"bi_64.png", {"x": xy, "y": xy}, "picked up bounty");break;
    case "bountyextracted":e = BuildImage(i_path+"be_64.png", {"x": xy, "y": xy}, "extracted bounty");break;
    case "downedbyme": e = BuildImage(i_path+"dbm_32.png", {"x": xy, "y": xy}, "you downed him");break;
    case "killedbyme": e = BuildImage(i_path+"kbm_32.png", {"x": xy, "y": xy}, "you killed him");break;
    case "downedme": e = BuildImage(i_path+"dm_32.png", {"x": xy, "y": xy}, "downed you");break;
    case "killedme": e = BuildImage(i_path+"km_32.png", {"x": xy, "y": xy}, "killed you");break;
    case "killedbyteammate": e = BuildImage(i_path+"kbt_32.png", {"x": xy, "y": xy}, "killed by mate");break;
    case "downedbyteammate": e = BuildImage(i_path+"dbt_32.png", {"x": xy, "y": xy}, "downed by mate");break;
    case "downedteammate": e = BuildImage(i_path+"dt_32.png", {"x": xy, "y": xy}, "downed mate");break;
    case "killedteammate": e = BuildImage(i_path+"kt_32.png", {"x": xy, "y": xy}, "killed mate");break;
    default: break;
  }
  return e;
}

function BuildImage(path, size, title)
{
  if (!title){title = "FUCK CAPITALISM"};
  let icon = "<image src='"+path+"' width='"+size.x+"' height='"+size.y+"' title='"+title+"'></image>";
  return icon
}

function DrawContent(content)
{
  document.getElementById("content").innerHTML = content;
}

function DrawTo(target, content)
{
  document.getElementById(target).innerHTML = content;
}

function BuildGrid()
{
  let h = "<div id='gamestats'></div><div id='history'></div>";
  return h;
}

function SetVisibilityOfClass(classname, visibility)
{
  let es = document.getElementsByClassName(classname);
  for (let e=0,eL=es.length;e<eL;e++)
  {
    es[e].style.visibility = visibility;
  }
}


function AddElementToClass(e, classname)
{
  e.classList.add(classname);
}

function RemoveClassFromElement(e, classname)
{
  e.classList.remove(classname);
}
