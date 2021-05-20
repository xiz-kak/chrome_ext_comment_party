class RotateIcon {

    constructor(srcIcon, iconWidth=19, iconHeight=19){
        // 元になるアイコンパス
        this.srcIcon = srcIcon;
        this.image = new Image();
        this.canvas = document.createElement("canvas");
        // chrome iconは19 x 19 まで。
        this.canvas.width = iconWidth;
        this.canvas.height = iconHeight;
        this.context = this.canvas.getContext('2d');

        // アイコン回転角
        this.degree = 0;
        // 画像が準備済か
        this.isReady = false;
        this.image.onload = ()=>{
            this.isReady = true;
        };
        this.image.src = srcIcon;
        this.timer = null;
    }
    _setIcon(){
        // あまりないが画像準備ができてなければ何もしない
        if(!this.isReady){
            return;
        }

        // 既存画像のクリア
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.save();
        //回転 軸をずらして回して軸を戻す
        this.context.translate(parseInt(this.canvas.width / 2), parseInt(this.canvas.height / 2)); 
        this.context.rotate((this.degree * Math.PI) / 180);
        this.context.translate(-parseInt(this.canvas.width / 2), -parseInt(this.canvas.height / 2));

        // 画像をキャンパスサイズにリサイズ
        this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.canvas.width, this.canvas.height);
        // iconにセット
        chrome.browserAction.setIcon({
            imageData: this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        });
        // キャンバスの状態を初期化
        this.context.restore();
    }
    reset(){
        if(this.timer){
            clearInterval(this.timer);
        }
        this.degree = 0;
        this._setIcon();
    }
    rotate(){
        this.reset();

        this.timer = setInterval(()=>{
            this.degree = (this.degree + 5) % 360;
            this._setIcon();
        }, 20)
    }
}
