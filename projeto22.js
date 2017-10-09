var input = document.getElementById("input");
var result = document.getElementById("result");
var fnames=[];
var constants = {};

var Calc={
  hasVar:function(txt){
    return txt.search(/([A-Za-z]+\_*\-*\d*)/)!=-1;
  },
  isEq:function(txt){
    return txt.search(/(\d*\**([A-za-z])+(\^|\+|\/))|((\+|\/|[\d]+)\**([A-za-z]))/)!=-1;
  },
  setResultPanel:function(fname,myresult,args){
    result.innerHTML = fname+((args!=undefined)?"("+args+")":"")+((myresult!=undefined)?"="+myresult:"");
  },
  setFormulaPanel:function(fname,mytext){
    input.value="";
    var fNameNode = document.getElementById(fname);
    if((fNameNode==null)||(fNameNode==undefined)){
      mformula.innerHTML+="<div id='"+fname+"'>"+(fname+mytext)+"<span onclick=\"geraFormula('clear("+fname+")')\">x</span></div>";
    }else{
      fNameNode.parentNode.removeChild(fNameNode);
      mformula.innerHTML+="<div id='"+fname+"'>"+(fname+mytext)+"<span onclick=\"geraFormula('clear("+fname+")')\">x</span></div>";
    }
  },
  setF:function(fname,args,formula){
    fnames.push(fname);
    var args2="'"+args.replace(",", "','")+"'";
    var arrayArgs = args.split(",");
    try{
      eval(fname+"=nerdamer('"+formula+"').buildFunction(["+args2+"])");
      eval(fname+"l={};");
      for(var i=0;i<arrayArgs.length;i++){
        eval(fname+"l[\""+arrayArgs[i]+"\"]=nerdamer(nerdamer.diff(\""+formula+"\",\""+arrayArgs[i]+"\").toString()).buildFunction(["+args2+"])");
      }
      Calc.setFormulaPanel(fname,"("+args+")="+formula);
    }catch(e){
      console.log(e);
    }

  },
  execExpression:function(formula,vals){
      return nerdamer(formula,vals).evaluate().toString();
  },
  execF:function(fname,args){
    var myresult;
    if(fname=="clear"||fname=="clear()"){
        Calc.clear(args);
        return;
    }
    try{
      if(args!=undefined){
            var x = nerdamer.reserved();
    
            if(x.search(" "+fname+",")!=-1){
              myresult = Calc.execExpression(fname+"("+args+")",constants);
            }else{
              myresult = eval(fname+"("+args+")");
            }
      }else{
        if(Calc.isEq(fname)){
          fname = Calc.execExpression(fname,constants);
        }else{
          if(Calc.hasVar(fname)){
            fname = Calc.execExpression(fname,constants);
          }else{
            fname = Calc.execExpression(fname);
          }
        }
      }
      Calc.setResultPanel(fname,myresult,args);
    }catch(e){
      console.log(e);
    }
  },
  setC:function(fname,formula){
    fnames.push(fname);
    if(Calc.isEq(formula)){
      var args = nerdamer(formula).variables();
      args = args.join(",");
      Calc.setF(fname, args, formula);
    }else{
      var myformula = Calc.execExpression(formula);
      eval(fname+"="+myformula);
      constants[fname]=myformula;
      Calc.setFormulaPanel(fname,"="+myformula);
    }
  },
  clear(fn){
      input.value="";
      if(fn==undefined){
        for(var i=0;i<fnames.length;i++){
          eval(fnames[i]+"=null");
          eval(fnames[i]+"l=null");
          var fNameNode = document.getElementById(fnames[i]);
          fNameNode.parentNode.removeChild(fNameNode);
          fnames.pop();
        }
        for(var i in constants){
          if(constants.hasOwnProperty(i)){
            constants[i]=null;
            var fNameNode = document.getElementById(i);
            fNameNode.parentNode.removeChild(fNameNode);
          }

        }
      }else{
        eval(fn+"=null");
        eval(fn+"l=null");
        constants[fn]=null;
        var fNameNode = document.getElementById(fn);
        fNameNode.parentNode.removeChild(fNameNode);
      }
  }
};


function geraFormula(text){
  var formula;
  text = text==undefined?input.value:text;
  if(text.search(/=/)!=-1){
    var aux = text.split("=");
    formula = aux[1];
    text = aux[0];
  }
  var fname = text.replace(/\([^\)]+\)/g, "");
  var args = text.replace(/[A-za-z]+\(([^\)]+)\)/g, "$1");
  args = (args==fname)?undefined:args;

  if(args==undefined){
    if(formula==undefined){
      Calc.execF(fname);
    }else{
      Calc.setC(fname,formula);
    }
  }else{
    if(formula==undefined){
      Calc.execF(fname,args);
    }else{
      Calc.setF(fname,args,formula);
    }
  }
}
