export class loginSetup{

    static randomSalt = ():string =>{
        const char:string = "0123456789";
        let code;
        
            code = '';
            for (let i = 0; i < 6; i++) {
                code += char.charAt(Math.floor(Math.random() * char.length));
            }
    
        return code;
    }
}   