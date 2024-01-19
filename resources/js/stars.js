function GetMMRInfo(mmr_value)
{
  //0-2000 = 1star
	//2000-2300 = 2star
	//2300-2600 = 3star
	//2600-2750 = 4star
	//2750-3000 = 5star
	//3000+ = 6star
  let mmr_info ={};
  switch(true)
  {
    case (mmr_value<=2000): mmr_info.stars = 1; mmr_info.next = 2000 - mmr_value; break;
    case (mmr_value<=2300): mmr_info.stars = 2; mmr_info.next = CalculateNextMMR(mmr_value, 2000, 2300); break;
    case (mmr_value<=2600): mmr_info.stars = 3; mmr_info.next = CalculateNextMMR(mmr_value, 2300, 2600);break;
    case (mmr_value<=2750): mmr_info.stars = 4; mmr_info.next = CalculateNextMMR(mmr_value, 2600, 2750);break;
    case (mmr_value<=3000): mmr_info.stars = 5; mmr_info.next = CalculateNextMMR(mmr_value, 2750, 3000);break;
    case (mmr_value<=5000): mmr_info.stars = 6; mmr_info.next = CalculateNextMMR(mmr_value, 3000, 5000);break;
    default: mmr_info.stars = null;break;
  }
  return mmr_info;
}

function CalculateNextMMR(mmr, low, high)
{
  let diff_low = mmr -low;
  let diff_high = high-mmr;

  if (diff_low<diff_high)
  {
    return diff_low *= -1;
  }
  return "+" +diff_high;
}

function BuildMMRStars(stars, size)
{
  let h = "";
  if (!size){size={};size.x = 16;size.y=16;}
  for (let s=1;s<=stars;s++)
  {
    h += "<image src='./icons/mmrstar"+s+".png' width='"+size.x+"px' height='"+size.y+"px'></image>";
  }
  return h;
}

function BuildMMRNext(difference)
{
  let classname = "positive";
  if (difference < 0){classname = "negative";}

  let span = "<span class='"+classname+" mmr_next'>" + difference + "</span>";

  return span;
}
