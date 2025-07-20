import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

let startTime: number;
let statusBarItem: vscode.StatusBarItem;
let saveInterval: NodeJS.Timeout;
const trackerPath = path.join(os.homedir(), '.vscode-tools', 'tracker.json');

// ---- Activation ----
export function activate(context: vscode.ExtensionContext) {
    startTime = Date.now();

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
    statusBarItem.tooltip = 'Total VS Code Usage Time';
    context.subscriptions.push(statusBarItem);

    updateStatusBar();
    setInterval(updateStatusBar, 60000);

    saveInterval = setInterval(saveTimeIncrementally, 60000);

    const syncEnabled = vscode.workspace.getConfiguration().get<boolean>('ticksync.enableCloudSync', true);
    if (syncEnabled) {
        checkDailyGistSync();
    }
}

// ---- Tracker Data Handling ----
function readTrackerData(): { totalSeconds: number, lastSyncDate?: string } {
    try {
        if (fs.existsSync(trackerPath)) {
            const content = fs.readFileSync(trackerPath, 'utf8');
            const data = JSON.parse(content);
            return {
                totalSeconds: data.totalSeconds || 0,
                lastSyncDate: data.lastSyncDate
            };
        }
    } catch (err) {
        console.error('Error reading tracker file:', err);
        vscode.window.showErrorMessage('Failed to read tracker data.');
    }
    return { totalSeconds: 0 };
}

function writeTrackerData(totalSeconds: number, lastSyncDate?: string) {
    try {
        const data: any = {
            totalSeconds,
            formatted: formatTime(totalSeconds)
        };
        if (lastSyncDate) data.lastSyncDate = lastSyncDate;
        fs.mkdirSync(path.dirname(trackerPath), { recursive: true });
        fs.writeFileSync(trackerPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing tracker file:', err);
        vscode.window.showErrorMessage('Failed to write tracker data.');
    }
}

// ---- Display ----
function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
}

function updateStatusBar() {
    const { totalSeconds: savedSeconds } = readTrackerData();
    const sessionSeconds = Math.floor((Date.now() - startTime) / 1000);
    const totalSeconds = savedSeconds + sessionSeconds;

    statusBarItem.text = `⏱ ${formatTime(totalSeconds)}`;
    statusBarItem.show();
}

// ---- Local Save ----
async function saveTimeIncrementally() {
    const now = Date.now();
    const sessionSeconds = Math.floor((now - startTime) / 1000);
    const { totalSeconds: savedSeconds, lastSyncDate } = readTrackerData();
    const newTotal = savedSeconds + sessionSeconds;

    writeTrackerData(newTotal, lastSyncDate);
    startTime = now;
}

// ---- Daily Gist Sync ----
async function checkDailyGistSync() {
    const today = new Date().toISOString().split('T')[0];
    const data = readTrackerData();

    if (data.lastSyncDate === today) return;

    const success = await syncToGist(JSON.stringify({
        totalSeconds: data.totalSeconds,
        formatted: formatTime(data.totalSeconds),
        lastSyncDate: today
    }, null, 2));
    
    if (success) {
        writeTrackerData(data.totalSeconds, today);
        vscode.window.showInformationMessage(`Ticksync: Successfully synced usage time to Gist (${today})`);
    }
}

// ---- GitHub Gist Integration ----
async function syncToGist(content: string): Promise<boolean> {
    const token = vscode.workspace.getConfiguration().get<string>('ticksync.githubToken');
    const gistId = vscode.workspace.getConfiguration().get<string>('ticksync.gistId');

    if (!token || !gistId) {
        vscode.window.showWarningMessage('Ticksync: GitHub token or Gist ID is missing in settings.');
        return false;
    }

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                files: {
                    "tracker.json": {
                        content
                    }
                }
            })
        });

        if (!response.ok) {
            const msg = `GitHub API error: ${response.statusText}`;
            console.error(msg);
            vscode.window.showErrorMessage(`Ticksync: Failed to sync to Gist – ${response.statusText}`);
            return false;
        }

        return true;

    } catch (err) {
        console.error('Failed to sync to Gist:', err);
        vscode.window.showErrorMessage(`Ticksync: Error syncing to Gist. Check console for details.`);
        return false;
    }
}

// ---- Deactivation ----
export async function deactivate() {
    if (saveInterval) {
        clearInterval(saveInterval);
    }
    await saveTimeIncrementally();
}
