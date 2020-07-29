// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';
import { writeFile, readFileSync } from 'fs';
import csvSync = require("csv-parse/lib/sync");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "loginbonus" is now active!');

	let loginBonus = new LoginBonus();

	//let controller = new LoginBonusController(loginBonus);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	/*
	let disposable = commands.registerCommand('helloworld.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		//window.showInformationMessage('Hello World from helloworld!');

		loginBonus.updateLoginBonus();
	});
	*/
	loginBonus.updateLoginBonus();

	//context.subscriptions.push(disposable);
	//context.subscriptions.push(controller);
	context.subscriptions.push(loginBonus);	
}

// this method is called when your extension is deactivated
export function deactivate() {}

class LoginBonus{
	//ステータスバーリソース用
	private _statusBarItem: StatusBarItem;

	public updateLoginBonus(){
		if (!this._statusBarItem){
			//ステータスバーのリソースを取得
			this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		}

		let path = __dirname + "\\date.csv";
		let dt = new Date();
		let formattedDate = dt.getFullYear() * 10000 + (dt.getMonth() + 1) * 100 + dt.getDate();

		try{
			let data = readFileSync(path); //エラー処理対象
			let matrix = csvSync(data);
			let dateArray = matrix[0]; //2次元配列で処理されるため、1次元に直す
			
			//今日初めてのログインなら書き込みを行なう
			if(dateArray[0] !== String(formattedDate)){
				dateArray.unshift( String(formattedDate) ); //今日の日付を配列に追加

				let formattedCsv = "";
				//CSV形式に直す
				for(var day of dateArray){
					formattedCsv = formattedCsv + "," + day;
				}
				//始めのコンマを消すための処理
				formattedCsv = formattedCsv.substr(1);

				writeFile(path, formattedCsv, (err) =>{
					//書き込み後の処理をここに書く。
					if(err) {
						console.log("書き出し時にエラーが発生しました。" + err);
					} else {
						console.log("ファイルが正常に書き出しされました");
					}
				});
			}

			//ステータスメッセージの設定
			this._statusBarItem.text = this.WriteStatus(dateArray);
			this._statusBarItem.show();

		} catch(err){
			console.log("読み込み時にエラーが発生しました。" + err);
			this._statusBarItem.hide();
		}
	}

	//ステータスバーに表示するログインボーナスの内容を決める(文字列)
	private WriteStatus(loginDatesStr : string[]): string{
		//文字列の日付を数値に変換
		let loginDatesNum: number[] = loginDatesStr.map( str => parseInt(str, 10));
		let loginDates: Date[] = loginDatesNum.map( num => new Date(num / 10000,(num % 10000) / 100 - 1,num % 100 + 1));

		let message : string = "";
		//連続ログイン日数表示
		let continuous : number = 1;
		if(loginDates.length > 1){
			for(var _i = 1; _i < loginDates.length; _i++){
				let predayTommorow = new Date(loginDates[_i].getFullYear(), loginDates[_i].getMonth() ,loginDates[_i].getDate() + 1);
				if(loginDates[_i - 1].getTime() === predayTommorow.getTime()){
					continuous++;
				}
				else{
					break;
				}
			}
		}
		message += "連続ログイン:" + String(continuous) + "日 ";
		
		//総ログイン日数表示
		message += "総ログイン日数:" + String(loginDatesNum.length) + "日";
		//応援メッセージとか報酬(?)とか
		return message;
	}

	//リソース解放用
	dispose() {
		this._statusBarItem.dispose();
	}
}

/*
class LoginBonusController{

	private _loginBonus: LoginBonus;
	private _disposable: Disposable;

	constructor(loginBonus: LoginBonus){
		this._loginBonus = loginBonus;
		this._loginBonus.updateLoginBonus();

		let subscriptions: Disposable[] = [];
		//window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
		window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

		this._disposable = Disposable.from(...subscriptions);
	}

	dispose(){
		this._disposable.dispose();
	}

	private _onEvent(){
		this._loginBonus.updateLoginBonus();
	}
}
*/
