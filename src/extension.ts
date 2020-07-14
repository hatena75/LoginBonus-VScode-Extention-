// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	let wordCounter = new WordCounter();

	let controller = new WordCounterController(wordCounter);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	/*
	let disposable = commands.registerCommand('helloworld.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		//window.showInformationMessage('Hello World from helloworld!');

		wordCounter.updateWordCounter();
	});
	*/

	//context.subscriptions.push(disposable);
	context.subscriptions.push(controller);
	context.subscriptions.push(wordCounter);	
}

// this method is called when your extension is deactivated
export function deactivate() {}

class WordCounter{
	//ステータスバーリソース用
	private _statusBarItem: StatusBarItem;

	public updateWordCounter(){
		if (!this._statusBarItem){
			//ステータスバーのリソースを取得
			this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		}

		//アクティブなエディタを取得、見つからない場合は、ステータスバーを非表示にして、何もしない
		let editor = window.activeTextEditor;
		if(!editor){
			
			this._statusBarItem.hide();
			return;
		}

		//エディタ内のドキュメントを取得
		let doc = editor.document;

		//マークダウンなら単語をカウント
		if(doc.languageId === "markdown"){
			let wordCount = this._getWordCount(doc);

			this._statusBarItem.text = wordCount !== 1 ? `$(pencil) ${wordCount} Words` : '$(pencil) 1 Word';
			this._statusBarItem.show();
		}
		else{
			this._statusBarItem.hide();
		}
	}

	public _getWordCount(doc: TextDocument): number {
		let docContent = doc.getText();

		//テキストの先頭と最後の2文字以上の空白を削除
		docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

		let wordCount = 0;
		if(docContent !== ""){
			//スペース分割によってカウント
			wordCount = docContent.split(" ").length;
		}

		return wordCount;
	}

	//リソース解放用
	dispose() {
		this._statusBarItem.dispose();
	}
}

class WordCounterController{

	private _wordCounter: WordCounter;
	private _disposable: Disposable;

	constructor(wordCounter: WordCounter){
		this._wordCounter = wordCounter;
		this._wordCounter.updateWordCounter();

		let subscriptions: Disposable[] = [];
		window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
		window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

		this._disposable = Disposable.from(...subscriptions);
	}

	dispose(){
		this._disposable.dispose();
	}

	private _onEvent(){
		this._wordCounter.updateWordCounter();
	}
}
