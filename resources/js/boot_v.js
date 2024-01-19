function CreateFormLetUserSelectFolder(title)
{
  if (!title){title = "select your hunt showdown user folder"};
  let html = "<table>"
           + "<tr>"
           + "<th>"+title+"</th>"
           + "</tr>"
           + "<tr>"
           + "<td>.../steamapps/common/Hunt Showdown/user</td>"
           + "</tr>"
           + "<tr>"
           + "<td id='inp_userfolderselectedpath'>nothing selected yet</td>"
           + "</tr>"
           + "<tr>"
           + "<td><button onclick='PopupMenuLetUserSelectUserFolder("+'"inp_userfolderselectedpath"'+")'>select</button></td>"
           + "</tr>"
           + "</table>";
    return html;
}
