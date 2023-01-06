import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	header: string
}

const DEFAULT_SETTINGS: PluginSettings = {
	header: ''
}

export default class MoveTasks extends Plugin {
	settings: PluginSettings;

	async onload() {
		// Setup Settings Tab
		await this.loadSettings();
		this.addSettingTab(new MoveTasksSettingTab(this.app, this));	
		
		// Move tasks to header
		this.addCommand({
			id: 'move-tasks',
			name: 'Move tasks to header',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const doc = view.getViewData();
				let content = "";
				const line = editor.getLine(editor.getCursor().line);
				content = line
				content = content.replace(/^- /,"")
				const tasks = doc.split("\n- ");
				const lines = tasks.find(a => a.includes(content))
				const notesArray = lines.split('\n')
				notesArray.shift();
				
				function filterItems(arr, query) {
					return arr.filter(function(el) {
						return el.toLowerCase().indexOf(query.toLowerCase()) !== -1
					})
				}
				
				const a = filterItems(notesArray,"\t- ");
				const subTasks = a.join('\n');  
				
				content = "- " + content.replace(/^\s*[\r\n]/gm,"") + "\n" + subTasks.replace(/^\s*[\r\n]/gm,"")
				
				const newDoc = doc.replace(content,"").replace("# Inbox\n","# Inbox\n\n").trim();
				const re = new RegExp("\\[ \\] ")
				let icon = ""
				if(content.match(re)){
					icon = "- "
				}
				else{
					icon = "- [ ] "
				}
				const newText = newDoc.replace(this.settings.header+ "\n", this.settings.header+ "\n\n" + icon + content.slice(2))

				view.setViewData(newText,false)
			}
		});
	}
	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MoveTasksSettingTab extends PluginSettingTab {
	plugin: MoveTasks;

	constructor(app: App, plugin: MoveTasks) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Move Tasks Plugin.'});

		new Setting(containerEl)
			.setName('Header')
			.setDesc('Which Header to Move Tasks To?')
			.addText(text => text
				.setPlaceholder('# Now')
				.setValue(this.plugin.settings.header)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.header = value;
					await this.plugin.saveSettings();
				}));
	}
}
