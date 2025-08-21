import { checkSchema } from "express-validator";

export default checkSchema({  
    fullName:{      
        optional:true,  
        trim:true,
         isString:{
            errorMessage:"fullName Name must be a string"
        },
    },
     contact:{      
        optional:true,  
        trim:true,        
    }   
})
