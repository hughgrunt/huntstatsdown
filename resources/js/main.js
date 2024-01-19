// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library
function setTray() {
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }
    let tray = {
        icon: "/resources/icons/trayIcon_custom.png",
        menuItems: [
            {id: "SHOW", text: "show"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "quit"}
        ]
    };
    Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
    switch(event.detail.id) {
        case "SHOW":
            Neutralino.window.show();
            break;
        case "QUIT":
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose()
{
  Neutralino.window.hide();
}


Neutralino.init();
async function setIcon()
{
  try
  {
    const icon = './icons/appIcon.png';
    await Neutralino.window.setIcon(icon);
  }
  catch(e)
  {
    console.log(e.message);
  }

}

Neutralino.events.on("ready", setIcon);
Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}
