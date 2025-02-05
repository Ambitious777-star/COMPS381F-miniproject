const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const formidable = require('express-formidable');


const assert = require('assert');
const http = require('http');
const url = require('url');
 
const mongourl = 'mongodb+srv://kevinying:199898@cluster0.t3hbl.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';
var username = '';
var alreadyusername;

app.set('view engine','ejs');
const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
	{name: 'demo', password:''},
	{name: 'student', password:''}
);

app.use(session({
    name: 'loginSession',
    keys: [SECRETKEY]
  }));
  
  
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.get('/login', (req,res) => {
    if(!req.session.authenticated){
      res.status(200).render('loginpage',{});
    }else{
        res.redirect('/find');
    }

       });

  app.post('/login', (req,res) => {
    
       console.log("checking");
       users.forEach((user) => {
           if (user.name == req.body.name && user.password == req.body.password) {
               // correct user name + password
               // store the following name/value pairs in cookie session
               req.session.authenticated = true;        // 'authenticated': true
               req.session.username = req.body.name;	 // 'username': req.body.name	
                   
           }
       });
       res.redirect('/find');
         
   });
   



app.use(formidable());//next
app.set('view engine','ejs');



// Find function
const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('newrestaurant1').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
        assert.equal(err,null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}

const handle_Find = (res, req, criteria) => {
    const client = new MongoClient(mongourl);
    if(req.session.authenticated){
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('list',{nNewrestaurant1: docs.length, newrestaurant1: docs});
            

        });
    });
     }else{
        res.redirect('/login');
     }

}

//Delete
/*
const deleteDocument = (DOCID, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

    db.collection('newrestaurant1').deleteOne(
        {
            _id : DOCID
        },
        (err,results) => {
        assert.equal(err,null);
        console.log('deleteOne was successful');
        callback(results);
    }
    );
});
}
 deleteDocument( DOCID,(results) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: `deleted 1 document(s)`});
            
           
        });
*/
const handle_Delete = (res, req, criteria) => {
 
    

    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id);
        //DOCID['_id'] = ObjectID(req.fields._id);
        console.log(req.session.username);

    if(username==req.session.username){
       db.collection('newrestaurant1').deleteOne({"_id" :DOCID['_id']},(err) => {
        client.close();
        assert.equal(err,null);
        res.status(200).render('info', {message: `Deleted 1 document(s)`});
    });
}else{
    res.status(200).render('info', {message: `You cannot not delete this document!`});
}

        
       
    });
}


const handle_Details = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        /* use Document ID for query */
        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        findDocument(db, DOCID, (docs) => {  // docs contain 1 document (hopefully)
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {newrestaurant1: docs[0]});
        });

    });
}


const handle_Edit = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        /* use Document ID for query */
        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('newrestaurant1').find(DOCID);
        cursor.toArray((err,docs) => {

            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{newrestaurant1: docs[0]});

            
        });
    });
}

/*
const rateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('newrestaurant1').insertOne(criteria,
           {
            

           }

            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
         );
    });
}
*/
// rate cannot
const handle_Rate = (req, res, criteria) => {
    
      const client = new MongoClient(mongourl);
      client.connect((err) => {
          assert.equal(null, err);
          console.log("Connected successfully to server");
          const db = client.db(dbName);
          
          let DOCID = {};
           
          DOCID['_id'] = ObjectID(req.fields._id); 
          console.log(DOCID);
          //var searchstr = 'ObjectId('+ req.fields._id + ')';
          
          
         // var updateDoc = {};
         // updateDoc['score'] = req.fields.score; 
          
          console.log(req.fields.score);
          var updateStr = {$push:{score:req.fields.score}};
         // var updateStr =  { $push: { score: 22 } };
         if(req.session.username!=alreadyusername){
            
            alreadyusername=req.session.username;
         if(req.fields.score>10 || req.fields.score<0){
            res.status(200).render('info', {message: `Rate cannot be greater than 10 or smaller than 0`});
         }else {
         
           
//{"_id" :DOCID['_id']}  {$set: { "score" : req.fields.score }}
// db.collection('newrestaurant1').deleteOne({"_id" :DOCID['_id']},(err) => {
         db.collection('newrestaurant1').updateOne({"_id" :DOCID['_id']},updateStr,(err) => {
         console.log("updated!!!!");    
          client.close();
          assert.equal(err,null);
          res.status(200).render('info', {message: `Rated, thank you`});
      });
    }
         }else {
            res.status(200).render('info', {message: `You can only rate one time`});

         }
      });
  }


const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('newrestaurant1').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Update = (req, res, criteria) => {
  
        var DOCID = {};
        DOCID['_id'] = ObjectID(req.fields._id);  //修改了要补充的req
        var updateDoc = {};
        updateDoc['restaurant_id'] = req.fields.restaurant_id;
        updateDoc['name'] = req.fields.name;
        updateDoc['borough'] = req.fields.borough;
        updateDoc['cuisine'] = req.fields.cuisine;
        updateDoc['street'] = req.fields.street;
        updateDoc['building'] = req.fields.building;
        updateDoc['zipcode'] = req.fields.zipcode;
        updateDoc['coord1'] = req.fields.coord1;
        updateDoc['coord2'] = req.fields.coord2;

        updateDoc['user'] = req.fields.user;
        updateDoc['score'] = req.fields.score;
        updateDoc['owner'] = req.fields.owner;

        if (req.files.filetoupload.size > 0) {
            fs.readFile(req.files.filetoupload.path, (err,data) => {
                assert.equal(err,null);
                updateDoc['photo'] = new Buffer.from(data).toString('base64');
                updateDocument(DOCID, updateDoc, (results) => {
            res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`});
                    
                });
            });
        } else {
            updateDocument(DOCID, updateDoc, (results) => {
            res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`});
           
            });

        }
    }

const createDocument = (createDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);


        db.collection('newrestaurant1').insert(
            createDoc,

            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });

}


const handle_Create = (req, res) => {
    
      
       // var DOCID = {};
       // DOCID['_id'] = ObjectID(req.fields._id);  //修改了要补充的req
        var createDoc = {};
        createDoc['restaurant_id'] = req.fields.restaurant_id;
        createDoc['name'] = req.fields.name;
        createDoc['borough'] = req.fields.borough;
        createDoc['cuisine'] = req.fields.cuisine;
        createDoc['street'] = req.fields.street;
        createDoc['building'] = req.fields.building;
        createDoc['zipcode'] = req.fields.zipcode;
        createDoc['coord1'] = req.fields.coord1;
        createDoc['coord2'] = req.fields.coord2;
        createDoc['user'] = req.fields.user;
        createDoc['score'] = req.fields.score;
        username = req.session.username;
        console.log(username);


         if (req.files.filetoupload.size > 0) {
            fs.readFile(req.files.filetoupload.path, (err,data) => {
                assert.equal(err,null);
                createDoc['photo'] = new Buffer.from(data).toString('base64');
                createDocument(createDoc, (results) => {
            res.status(200).render('info', {message: `Create 1 document(s)`});
                });
            });
        } else {
            createDocument(createDoc, (results) => {
            res.status(200).render('info', {message: `Created 1 document(s)`});
          
            }); 
        }
   }
   
const findRestaurants = (db, criteria, callback) => {
	restaurants = [];
	if (criteria != null) {
   		var cursor = db.collection('newrestaurant1').find(criteria);
	}
	else {
		var cursor = db.collection('newrestaurant1').find();
	}
	cursor.toArray((err,docs) => {
		assert.equal(err,null);
		callback(docs);
	})
};
/*
const findDistinctBorough = (db, callback) => {
	db.collection('newrestaurant1').distinct("borough", (err,docs) => {
		console.log(docs);
		callback(docs);
	});
}
*/

const handle_Search = (res, req) => {
    const client = new MongoClient(mongourl);
    if(req.session.authenticated){
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
       if(req.fields.borough!=""){
           console.log(req.fields.searchQ,8888,req.fields.selected);
        var searchc = req.fields.borough;
        var criteria={};
        criteria['borough']=searchc;
        findRestaurants(db, criteria, (docs) => {
            console.log('findddddddd1');
            client.close();
            console.log("Closed DB connection");
           // res.status(200).render('list',{nNewrestaurant1: docs.length, newrestaurant1: docs});
           res.status(200).json(docs);


        });
    }
    else if(req.fields.name!=""){
        var searchc = req.fields.name;
        var criteria={};
        criteria['name']=searchc;
        findRestaurants(db, criteria, (docs) => {
            console.log('findddddddd2');
            client.close();
            console.log("Closed DB connection");
           // res.status(200).render('list',{nNewrestaurant1: docs.length, newrestaurant1: docs});
           res.status(200).json(docs);


        });
    }
    else if (req.fields.cob!=""){
        var searchc = req.fields.cob;
        var criteria={};
        
        criteria['cuisine']=searchc;
        
        findRestaurants(db, criteria, (docs) => {
            console.log('findddddddd3');
            client.close();
            console.log("Closed DB connection");
           
           // res.status(200).render('list',{nNewrestaurant1: docs.length, newrestaurant1: docs});
           res.status(200).json(docs);


        });
    }
        
    });
     }else{
        res.redirect('/login');
     }

}


/*
app.get('/', (req,res) => {
    res.redirect('/login');
})
*/


app.get('/find', (req,res) => {
    handle_Find(res, req, req.query.docs);
})

app.get('/delete', (req,res) => {
    handle_Delete(res, req, req.query);
})

app.get('/details', (req,res) => {
    handle_Details(res, req.query);
})

app.get('/edit', (req,res) => {
    handle_Edit(res, req.query);
})

app.get('/ratepage', (req, res) => {
    res.status(200).render('ratepage',{objID: req.query._id});
})

app.post('/rate', (req, res) => {
    handle_Rate(req, res, req.query);
})

app.post('/update', (req,res) => {
    handle_Update(req, res, req.query);
})

app.get('/page', (req, res) => {
    res.status(200).render('page');
})

app.post('/create', (req,res) => {
    handle_Create(req, res);
    //res.status(200).render('create');
})
app.get('/searchpage', (req, res) => {
    res.status(200).render('searchpage');
})

app.post('/search', (req, res) => {
    handle_Search (res, req);  
})
/*
app.get('/*', (req,res) => {
    //res.status(404).send(`${req.path} - Unknown request!`);
  res.status(404).render('info', {message: `${req.path} - Unknown request!` });
 // res.status(200).render('loginpage',{});

})
*/


app.get('/', (req,res) => {
    //console.log(req.session);
    //res.redirect('/login');
    //res.status(200).render('loginpage');
    
    if (!req.session.authenticated) {    // user not logged in!
        //res.redirect('/login');
        res.status(200).render('loginpage');
	} else {
        
       // res.status(200).render('list',{nNewrestaurant1: docs.length, newrestaurant1: docs});
       res.redirect('/find');

    }
    
});


//find name
app.get('/api/restaurant/name/xxx', (req,res) => {
    if (req.params.xxx) {
       let criteria = {};
       criteria['name'] = req.params.xxx;
       const client = new MongoClient(mongourl);
       client.connect((err) => {
           assert.equal(null, err);
           console.log("Connected successfully to server");
           const db = client.db(dbName);

           findDocument(db, criteria, (docs) => {
               client.close();
               console.log("Closed DB connection");
               res.status(200).json(docs);
           });
       });
   } else {
       res.status(500).json({"error": "missing name"});
   }
}) ;   
//find borough
app.get('/api/restaurant/borough/yyy', (req,res) => {
   if (req.params.yyy) {
       let criteria = {};
       criteria['borough'] = req.params.yyy;
       const client = new MongoClient(mongourl);
       client.connect((err) => {

           assert.equal(null, err);
           console.log("Connected successfully to server");
           const db = client.db(dbName);

           findDocument(db, criteria, (docs) => {
               client.close();
               console.log("Closed DB connection");
               res.status(200).json(docs);
           });
       });
   } else {
       res.status(500).json({"error": "missing borough"});
   }
});
// find cuisine
app.get('/api/restaurant/cuisine/zzz', (req,res) => {
    if (req.params.zzz) {
       let criteria = {};
       criteria['cuisine'] = req.params.zzz;
       const client = new MongoClient(mongourl);
       client.connect((err) => {
           assert.equal(null, err);
           console.log("Connected successfully to server");
           const db = client.db(dbName);

           findDocument(db, criteria, (docs) => {
               client.close();
               console.log("Closed DB connection");
               res.status(200).json(docs);
           });
       });
   } else {
       res.status(500).json({"error": "missing borough"});
   }
});


app.get('/logout', (req,res) => {
	req.session = null;   // clear cookie-session
	res.redirect('/');
});
 
app.get("/leaflet", (req,res) => {
	res.render("leaflet.ejs", {
		lat:req.query.coord1,
        lon:req.query.coord2,
        //lat:22.3162,
        //lon:114.18,
        zoom:req.query.zoom ? req.query.zoom : 15

    });
    console.log(lat,lon);


	res.end();
});

app.listen(app.listen(process.env.PORT || 8099));
//app.listen(process.env.PORT || 8099);

//make a logout herf in the list.ejs