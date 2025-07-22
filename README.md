<div align="center">
<h1 align="center">Ticksync</h1>

<p align="center">
A VS Code extension that tracks and displays your total coding time directly in the status bar, with built-in support for daily sync to a GitHub Gist for seamless cloud backup. I built this as a personal alternative to WakaTime, aiming for a simpler and more accurate way to monitor my coding hours in VS Code.
</p>
</div>

## Getting Started

You can download the extension from the [Releases](https://github.com/kunal-ma/Ticksync/releases) page. Alternatively, you can build the extension yourself using the instructions in the [Building the Project](#building-the-project) section. 

### To install the extension:

1. **Inside VS Code**:
   - Open the Extensions panel.
   - Click the three-dot menu (`⋮`) in the top-right corner.
   - Select **"Install from VSIX..."** and choose the downloaded `.vsix` file.
   - You can also right-click the `.vsix` file in VS Code and choose **"Install Extension"**

2. **Via command line**:
   ```sh
   code --install-extension ticksync-1.0.0.vsix
   ```

Once installed, **Ticksync starts tracking your active coding time automatically**. Your total time is shown in the **status bar**, with **no manual setup required**.

## Configuration

Ticksync works out of the box for local usage, but you can customize the **position** and the **order** of the status bar item. Moreover, you can enable the built-in GitHub Gist sync for **cloud backups** and **dynamic badge integration**.

### Customization

- **Using the Settings UI**:  
  Open the settings (`Ctrl + ,`), search for "Ticksync", and:
  - Set the **Status Bar: Alignment** (`left` or `right`)
  - Set the **Status Bar: Priority** (e.g. `10`)

- **Or manually via `settings.json`**:  
  Add the following to your user settings:

  ```json
  {
    "ticksync.statusBar.alignment": "left", // "left" or "right" 
    "ticksync.statusBar.priority": 10 // Higher = more to the left/right
  }
  ```

### GitHub Gist Integration

1. **Create a GitHub Gist:** 
   - Visit [gist.github.com](https://gist.github.com/) and create a new **public or secret** gist.  
   - The gist **must contain only one file named `tracker.json`**. This file can be empty or include placeholder content like `{}`.  
   - Once created, **copy the Gist ID** from the URL.
   For example, 
   `https://gist.github.com/your-name/abcdefghijklmno` -> Gist ID is: `abcdefghijklmno`

2. **Generate a GitHub Token:**
   - Go to the [GitHub Tokens settings](https://github.com/settings/tokens) page.  
   - Select a type of token, Click **"Generate new token"**, give it a name (e.g. `Ticksync`), and **check the `gist` scope**. This permission allows Ticksync to update your Gist with your usage data.  
   - After generating the token, **copy it immediately** - you won’t be able to see it again later.

3. **Update your VS Code settings**

   - **Using the Settings UI**:  
     Open the settings (`Ctrl + ,`), search for "Ticksync", and:
     - Enable **Cloud Sync**
     - Enter your **GitHub Token**
     - Enter your **Gist ID**

   - **Or manually via `settings.json`**:  
     Add the following to your user settings:

     ```json
     {
       "ticksync.enableCloudSync": true,
       "ticksync.githubToken": "YOUR_GITHUB_TOKEN",
       "ticksync.gistId": "YOUR_GIST_ID"
     }
     ```
   
   - After applying the settings, **restart VS Code** to ensure syncing is activated properly.

### Dynamic Badge for README

If you've enabled GitHub Gist syncing, you can display your total usage time as a dynamic badge in your GitHub README using [Shields.io](https://shields.io/badges/dynamic-json-badge). Update the following parameters on the Shields.io dynamic JSON badge generator:

| Parameter | Value                                           |
| --------- | ----------------------------------------------- |
| URL       | `https://gist.github.com/USERNAME/GIST_ID/raw/` |
| Query     | `$.formatted`                                   |
| Label     | `Ticksync`                                      |
| Color     | `Blue`                                          |

## Building the Project

1. **Clone the repo or download the [ZIP file](https://github.com/kunal-ma/Ticksync/archive/refs/heads/main.zip):**

    ```sh
    git clone https://github.com/kunal-ma/Ticksync.git
    cd Ticksync
    ```

2. **Install the necessary dependencies:**

    ```sh
    npm install
    npm install vsce  # VS Code Extension Manager
    ```
3. **Compile and test the extension** (for development):

    ```sh
    npm run compile
    ```

    Then press F5 in VS Code or go to Run > Start Debugging to open the Extension Development Host window.

4. **Build the `.vsix` package:**

    ```sh
    npx vsce package
    ```

## Acknowledgements

Distributed under the GNU Affero General Public License v3.0. See <a href="https://github.com/kunal-ma/Ticksync/blob/main/LICENSE">`LICENSE`</a> for more information.

Your contributions can be invaluable to this project. If you have an idea to make this better, feel free to fork the repository and submit a pull request. Thank you for your support :)
