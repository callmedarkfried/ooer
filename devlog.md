# Devlog

### Day 33
- Added a sort of lockscreen
	- no real purpose, maybe it will prompt login, i dont know yet
	- Is shown on page load
	- reappears after 2 minutes without activity (aka mouse movement)
### Day 30
- Cookies (!!!)
- I dont really trust it tho. Good thing the server doesnt save the tokens permanently so if something happens, you can just restart i guess.
- Cookies are valid for 30 minutes after the last refresh. If you refresh within that time, the cookie gets renewed. 
- They only include the username and a unique and way too long token. 
- This presents a challenge for potential third party "applications", as of now they can easily just read the cookies, but that only becomes relevant once you have third party functionality tbh.
- While they are session cookies and thus get deleted 30 minutes after last refresh, i do not know how the legal situation is. They are not strictly necessary for the site to function but they do improve user experience somewhat.

### Day 29
- Started reducing the amount of code
- Added a script that removes all comments from js to further reduce size
	- Doesnt automatically update the scripts that are deployed
	- you have to manually copy the files to the according location, just follow the instructions from the "prepare for deploy.js"
	- not really necessary while working with it locally, but it does drastically reduce filesize when used as a website
	- Maybe ill implement a better solution 
- removed unused fonts, but kept the CSS entries for now
- further reduced initial load and more importantly future initial load. The client now requests image files manually as needed instead of loading all of them. 
- All these changes have cut down the size of the public folder from around 8MB to just over 1MB

### Day 26
- Reworking and restructuring of code
- Added new utility function: create()
	- shorthand for creating HTML Elements fast, takes the type as a string and an object containing the properties of the object

### Day 25
- Added left sidebar
- Basic syntax highlighting for the terminal
	- even works live
	- selecting text isnt possible for now, moving the cursor is
- Fixed layout issue with terminal, now it has word wrapping both when typing commands and when the past commands are displayed

### Day 24
- Terminal
	- Design basically finished
	- Terminal commands are handled serverside
	- commands so far:
	- cd (alias: chdir)
		- nav with no argument returns the current directory
		- nav < moves up one folder
		- nav </</ etc moves up as many folders as theres <
		- nav (/)foldername moves to the folder
		- nav (/)folder1/folder2/folder3 navigates to subfolders
		- There is no filesystem yet so naturally theres no checking if a folder exists
	- clear 
		- clears console
	- echo (alias: say, print)
		- simply repeats what you tell it to say. 
	- cmd
		- opens another terminal
	- ls
		- lists files and directories in current directory
	- Terminals have the wrong taskbar icon currently

### Day 22-23
- Documenting
- Simplified code for desktop symbols

### Day 21
- Fixed logout
- Changed no javascript message
- Added fonts (variations of Roboto because im creative like that)
- Changed notes and friends widgets slightly
	- Not final


### Day 20
- Added back calendar widget
	- Appointments are placeholders
	- Design isnt final but thats for another day
	- Cant be moved unlike notes and friends, considering keeping it this way (and not bc i cant figure out how to get it working)

- Closing the login screen is now possible 
- Signup screen is now accessible again
	- UI and clientside password checks now working
	- username and email checks arent working because those require the backend to work too and i dont feel like it
	- as such, you can not sign up yet (sadge)
	- Settings are now working again (at least it actually loads the correct pages now)

### Day 19
- Started rewriting things to use modules instead
	- This should take some time.
	- Some things dont work

### Day 18
- Removed previously added overwhelming sense of dread and drivelessness
- Reworked windows, done up to previous state, window management and dynamic scripts are simplified now
- Added JSDoc partially
- Added Error messages
	- Uses a bitmask for layout, see Documentation (lol)
	- Lack some functionality like retrying whatever caused the error
		- it will be up to the application, how the user input on error messages is handled.
	- not all options from the layout bitmask have been implemented
- Heartbeat signals from server to client to see, if connection is still alive.
	- An error pops up after 3 seconds prompting the user to retry the connection. 

### Days 11-17
- Added an overwhelming sense of dread and drivelessness

### Day 10
- fixed logout
- Added basic dynamic loading for scripts
	- Could be adapted to also allow dynamic CSS
	- Two ways of adding dynamic scripts:
		- Global scripts
		- Scripts linked to windows.
		- The latter gets removed when a window is closed
		- Known issue: Intervals keep executing
- Removed unnecessary/unused functions
	- Split up bigger functions into related chunks
- Window array cleanup is now generalised
- Started documenting code

### Day 9
- Reworked UI elements: 
	- toggleswitches and buttons are now their separate thing
	- Windows wont be able to be turned into custom objects easily
	- Window controls use custom class now
- Dropdown menu
- Reworked notes widget
### Day 8
- Settings menu now responsive
	- placeholder for categories
	- Server requests are in place, the settings subpages can be edited.
	- Fixed issue with settings category selection when having multiple settings windows open
- functional toggleswitches, not yet added anywhere useful.
- Desktop folders are fixed
- Fixed bug with window closing
	- Garbage collection issue when closing windows in the wrong order causing logout to fail and windows being unresponsive
- Added the first taskbar icons
- Minimising windows now works.
- Clicking on the taskbar icon of a background window sets it as the active window and puts it in the foreground.
- Context menus for taskbar icons: close, minimise, maximise.
	- Future potential for more customisation
- Slightly altered folder structure

### Day 7
- Window snapping (only maximising/restoring)
	- Window snapping has a short transition animation
- Settings menu now has a textbox for nicknames as well as the basis for a profile picture change
- Fixed issue with window dragging behaving weirdly with the window controls
- Widgets cannot be maximised by drag-snap
- Window snapping preview added
- Logging out is a thing now
- Startmenu now closes when clicking the desktop, in windows or when dragging widgets
- Crude first implementation of submenus for desktop symbols 
	- Optimal grid: as square as possible
- Clock widget now fixed
- Start menu now closes whenever you click outside it
### Day 6
- Small changes to start menu
	- Replaced dropdown with buttons for logout and settings
	- added permanent bottom row of special links
- Settings button now opens a settings window
- Settings window has different size constraints to regular windows
- Settings sidebar with categories
- A bunch of fixes 
- Fontawesome icons temporarily

### Day 5
- Reworked frontend
	- most event handlers are now in a separate file to clean things up a bit
	- code repetition has been minimised
- Window movement fixed
	- Can now be dragged around again
	- Cant be dragged off screen
	- Active window is now in foreground
- Minimum window size has been re-added
- Started keeping track of changes more rigorously
- Windows remember their size and position from before being maximised
- Window styling adjusts to maximised/default state


### Day 4
- Signup front end added
- Clientside password strength checks
	- Password conditions: 
		- >8 characters long
		- at least 3 of the 4 categories: uppercase, lowercase, digit, special characters
	- Password confirmation has to be correct
- Added handles for user menu in start menu
- Widget changes
	- can no longer be moved off screen
	- can now be minimised
	- are minimised by default
	- remember their size before they were minimised
	- minor changes to layout before login/when no notes or friends are available
- Hidden property now works properly
- Password fields now act as such
- Push notifications
- Notes are now saved serverside

### Day 3
- Desktop symbols
- Login added to front and back end
	- does not yet encrypt passwords
- Login button in start menu
- Logging in adds username and pfp to start menu
- non-functioning dropdown menu added
	
### Day 2
- Search button now calls searchbox
	- searchbox doesnt do anything 
	- has a neat animation for opening and closing
	- automatically focussed
- Start menu

### Day 1
- Clock widgets
- Notes widget (non-functional)
- Wallpaper
- Taskbar (not dynamic)
	- Start button (doesnt do anything)
	- Search button (also non-functional)
	- neither buttons have symbols