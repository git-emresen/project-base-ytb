/* const {EventEmitter}=require("events")
var instance=null;
class Emitter{
 
    constructor() {
       
        if(!instance){
            this.emitters={};
            instance=this;
        }
        return instance;
    }

    getEmitter(name){
        return this.emitters[name];
    }
    addEmitter(name){
        this.emitters[name]=new  EventEmitter(name);
        return this.emitters[name];
    }
    

}

module.exports=new Emitter(); */

const { EventEmitter } = require("events");

let instance = null;  // Singleton örneğini tutacak değişken

class Emitter {
  constructor() {
    // Eğer instance oluşturulmuşsa, mevcut instance'ı döndür
    if (instance) {
      return instance;
    }

    // İlk örneği oluştur
    this.emitters = {};
    instance = this;  // instance'a bu sınıfı atıyoruz
  }

  // İsimle EventEmitter almak
  getEmitter(name) {
    return this.emitters[name];
  }

  // Yeni bir EventEmitter eklemek
  addEmitter(name) {
    if (!this.emitters[name]) {
      this.emitters[name] = new EventEmitter();
    }
    return this.emitters[name];
  }
}

// Emitter sınıfının tek örneğini dışarıya export et
module.exports = new Emitter();
