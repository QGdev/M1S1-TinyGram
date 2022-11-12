const postRandomsUrl="api/apiTinyGram/v1/fetchNewPostsGlobal",likeUrl="api/apiTinyGram/v1/likePost/",isLikeUrl="api/apiTinyGram/v1/likeState/",followedUrl="api/apiTinyGram/v1/followState/",signInUrl="api/apiTinyGram/v1/signIn",connectUrl="api/apiTinyGram/v1/connect",userInfo="api/apiTinyGram/v1/basicUserInfos/",followUserUrl="api/apiTinyGram/v1/followUser/",postPublicationUrl="api/apiTinyGram/v1/postPublication";function connect(e){let s=jwt_decode(e.credential);User.init(s,e.credential),m.redraw()}var Connection={view:function(){return User.isLoged()?m("li",{class:"list-unstyled dropdown"},[m("button",{class:"btn material-icons unselectable",id:"iconUser","data-bs-toggle":"dropdown","aria-expanded":"false",type:"button"},m("img",{class:"iconProfile",src:User.getUrl()})),m("ul",{class:"dropdown-menu unselectable","aria-labelledby":"navbarDropdownMenuLink"},[m("li",m("a",{class:"dropdown-item",onclick:function(){MainView.changeView("profile")}},"Mon profil")),m("li",m("a",{class:"dropdown-item",onclick:function(){MainView.changeView("apropos")}},"A propos"))]),]):m("button",{class:"btn material-icons unselectable",id:"iconUser","data-bs-toggle":"dropdown","aria-expanded":"false",type:"button",onclick:function(){User.showConnectView()}},"account_circle")}},User={response:null,credential:null,listFollowers:[],listFollows:[],followers:0,follows:0,init:function(e,s){this.response=e,this.credential=s,User.connect()},connect:function(){return m.request({method:"PUT",url:"api/apiTinyGram/v1/connect",params:{access_token:User.getAccessToken()}}).then(function(e){Post.loadListRandom()}).catch(function(e){User.signIn()})},signIn:function(){let e=jwt_decode(User.getAccessToken()),s=void 0===e.family_name?"_":e.family_name,i=void 0===e.given_name?e.email.split("@")[0]:e.given_name;return m.request({method:"POST",url:"api/apiTinyGram/v1/signIn",params:{access_token:User.getAccessToken(),pseudo:i,fname:i,lname:s,pictureURL:e.picture}}).then(function(e){Post.loadListRandom()}).catch(function(e){window.alert("Erreur de connexion, veuillez r\xe9essayer")})},loadLists:function(){return m.request({method:"POST",url:"api/apiTinyGram/v1/followState/:UserID",params:{access_token:User.getAccessToken(),UserID:User.response.sub}}).then(function(e){User.followers=e.properties.nbFollow}),m.request({method:"GET",url:"url"}).then(function(e){this.listFollowers=this.listFollowers.sort(function(e,s){return e.localeCompare(s)}),this.listFollows=this.listFollows.sort(function(e,s){return e.localeCompare(s)}),User.listView=[...this.listFollowers]})},getAccessToken:function(){return this.credential},getUrl:function(){return this.response.picture},getName:function(){return this.response.name},isLoged:function(){return null!=this.response?(this.hideConnectView(),!0):(this.showConnectView(),!1)},follow:function(e){return m.request({method:"POST",url:"api/apiTinyGram/v1/followUser/:idUser",params:{idUser:e,access_token:User.getAccessToken()}}).then(function(s){Post.list.map(function(s){s.properties.creatorID==e&&(s.properties.userHasFollowed=!0)})})},showConnectView:function(){document.getElementById("login").className="container centered"},hideConnectView:function(){document.getElementById("login").className="hide"}},Post={list:[],myList:[],followedList:[],cursor:"",loadListPerso:function(){return m.request({method:"GET",url:"_ah/api/myApi/v1/myPosts/0?access_token="+User.getAccessToken()}).then(function(e){Post.myList=e.items},this.connectLikes(Post.list))},loadListRandom:function(){this.chargerSuivants()},chargerSuivants:function(){return m.request({method:"GET",url:"api/apiTinyGram/v1/fetchNewPostsGlobal",params:{access_token:User.getAccessToken(),cursor:Post.cursor}}).then(function(e){Post.list.push.apply(Post.list,e.items),Post.connectLikes(Post.list),Post.connectUser(Post.list),Post.cursor=e.nextPageToken})},connectLikes:function(e){e.map(function(e){m.request({method:"GET",url:"api/apiTinyGram/v1/likeState/:id",params:{id:e.key.name,access_token:User.getAccessToken()}}).then(function(s){e.properties.likes=s.properties.nbLikes,e.properties.like=s.properties.userHasLiked})})},connectUser:function(e){e.map(function(e){m.request({method:"GET",url:"api/apiTinyGram/v1/basicUserInfos/:UserID",params:{UserID:e.properties.creatorID,access_token:User.getAccessToken()}}).then(function(s){e.properties.creatorURL=s.properties.pictureUrl,e.properties.creatorPseudo=s.properties.pseudo,e.properties.userHasFollowed=s.properties.userHasFollowed})})},like:function(e){if(e.properties.like=!0,e.properties.likes++,User.isLoged()&&!e.properties.like)return m.request({method:"POST",url:"api/apiTinyGram/v1/likePost/:postId",params:{postId:e.key.name,access_token:User.getAccessToken()}}).then(function(e){})}},MainView={type:"welcome",view:function(){switch(this.type){case"welcome":return PostView.view();case"profile":return ProfileView.view();case"apropos":return AProposView.view()}},changeView:function(e){User.isLoged()&&(this.type!=e&&(this.type=e),"profile"==e?Post.loadListPerso():Post.loadListRandom())}},AproposView={view:function(){return[m("div",[m("h2","Qui sommes-nous ?"),m("div",[m("p",' L\'\xe9quipe cr\xe9atrice de cette excellente, incroyable, ph\xe9nom\xe9nale, invraisemblable, fantastique, extraordinaire, abracadabrante, impressionnante, stup\xe9fiante, rocambolesque, fantasmagorique application Web "TinyGram" est compos\xe9e de 3 \xe9tudiants de Nantes Universit\xe9. Qui sont ces membres hors du commun ?!?!? '),m("div",[m("h4",'Rodrigue Meunier alias "Rod4401 ou Captaine Rillettes"'),m("p"," Disposant d'un anglais proche de la perfection, Rodrigue Meunier a su investir corps et \xe2me afin de garantir une belle interface visuelle de cette application. Ce manceau n\xe9 en 2001 a la particularit\xe9 d'\xeatre un joueur professionnel Minecraft et cela en parall\xe8le de ses \xe9tudes. Il est tout \xe0 fait capable de construire un syst\xe8me en redstone qui scale et qui est efficace. Sa plus grande faiblesse se situe sur son t\xe9l\xe9phone, c'est Tiktok. ")]),m("div",[m("h4",'Quentin Gomes Dos Reis alias "ThinkIsPossible","Los Portos"'),m("p"," Cet individu poss\xe8de une photo de profil pour le moins... particli\xe8rement angoissante. Cet intriguant personnage effectue depuis plus de 3 ans la route en voiture ou en train tous les jours pour se rendre en cours \xe0 la fac depuis Clisson. Comment peut-on rester normal apr\xe8s \xe7a... Il est aussi connu pour avoir participer activement dans une organisation criminelle portugaise r\xe9volutionniste \xe0 distance, notamment en piratant la base de donn\xe9es de toutes les banques mondiales hormis les banques de sa propre contr\xe9e. ")]),m("div",[m("h4",'Valentin Goubon alias "TinkyValou"'),m("p"," Alors lui on se demande comment il est arriv\xe9 l\xe0. Plus efficace pour organiser un laser-game, ou bien pour devenir aussi puissant que Jotaro Kujo, Valentin a la particularit\xe9 aussi de ne pas toujours venir en cours, pour des probl\xe8mes de r\xe9veil. Nous verrons bien si les quelques s\xe9ances loup\xe9es ne lui seront pas indispensables dans sa r\xe9ussite scolaire. Le d\xe9l\xe9gu\xe9 de la promotion ALMA va devoir s'accrocher ! ")])])]),m("div",[m("h2","R\xe9sultats sur la scalabilit\xe9 de notre projet"),m("div",m("img",{src:"Image_1.jpg",width:"50%",alt:"Description + ou - d\xe9taill\xe9e des donn\xe9es si les images ne sont pas accessibles car pas ajout\xe9es."}))]),m("div",[m("h2","Lien vers notre projet"),m("div",m("p",[" Voici un lien vers notre projet Open Source, afin que vous puissiez admirer notre oeuvre. Si vous rencontrez le moindre souci sur notre application, ce qui est techniquement impossible, n'h\xe9sitez pas \xe0 contacter monsieur ",m("a",{href:"Pascal.Molli@univ-nantes.fr"},"Pascal Molli"),">. C'est notre directeur technique, il vous garantira une assistance hors du commun vous permettant de profiter de la meilleure exp\xe9rience possible afin de passer une bonne procrastination. Github : ",m("a",{href:"https://github.com/Rod4401/TinyGram"},"TinyGram")]))])]}},ProfileView={listView:[],type:"followers",active:"d-flex align-items-center justify-content-center unselectable border-0 border-top border-dark bg-light ms-2",passive:"d-flex align-items-center justify-content-center unselectable border-0 bg-light ms-2",view:function(){return m("div",{class:"container"},m("div",{class:"row row-cols-1 row-cols-lg-3"},[m("div",{id:"profileInfos",class:"col-lg-4 mb-2 mt-3 bg-light offset-lg-2 h-25"},[m("div",{class:"container"},m("div",{class:"row"},[m("div",{class:"col-3 postsProfilePicture w-25"},m("img",{style:"border-radius: 50%;",src:User.getUrl(),alt:"img_user",width:"100%",height:"100%",class:"unselectable"})),m("div",{class:"col-9 row-cols-1 pe-0"},[m("div",{class:"h-50 align-items-center d-flex"},m("h4",User.getName())),m("div",{class:"h-50 align-items-right d-flex"},[m("span",{class:"me-4"},User.followers+" followers"),m("span",{class:"me-4"},User.follows+" suivi(e)s")])])])),m("div",{class:"border-top d-flex justify-content-center"},[m("button",{type:"button",id:"followers",onclick:function(){ProfileView.changeView("followers")},class:"followers"==ProfileView.type?ProfileView.active:ProfileView.passive},[m("span",{class:"material-icons ms-0"},"groups"),m("span",{class:"ms-2"},"Followers")]),m("button",{type:"button",id:"follows",onclick:function(){ProfileView.changeView("follows")},class:"follows"==ProfileView.type?ProfileView.active:ProfileView.passive},[m("span",{class:"material-icons ms-0"},"people_alt"),m("span",{class:"ms-2"},"Follows")])]),m("div",{class:"rounded h-100"},[ProfileView.listView.map(function(e){return m("p",{class:"fw-bold"},e)})])]),m("div",{class:"col-lg-4 me-2 pe-0 ps-0 mt-3 mb-2 offset-lg-1 bg-light",id:"profilePosts"},m("div",{class:"container"},m("div",{class:"row"},[Post.myList.map(function(e){return m("div",{class:"col-4 postsProfilePicture"},m("div",{class:"container"},[m("div",{class:"d-flex align-items-center justify-content-center"},[m("img",{width:"100%",height:"100%",src:e.properties.url,class:"card unPost"}),m("div",{class:"hide likeStyle text-white",width:"100%"},"0♡")])]))})])))]))},changeView:function(e){this.type=e,this.search("")},search:function(e){this.listView=("followers"==this.type?User.listFollowers:User.listFollows).filter(s=>s.includes(e)),m.redraw()}},PostView={goTop:function(){window.scrollTo({top:0,behavior:"smooth"})},view:function(){return m("div",{class:"container d-flex justify-content-center",style:"width:400px;"},m("div",[Post.list.map(function(e){return m("div",{class:"border rounded row row-cols-1 mt-2 bg-white",id:e.key.name},[m("div",{class:"mt-2 ps-0 border-bottom col"},[m("div",{class:"container"},[m("div",{class:"row"},[m("div",{class:"col-1"},m("img",{class:"iconProfile unselectable",onclick:function(){User.follow(e.properties.creatorID)},src:e.properties.creatorURL})),m("div",{class:"col-3 pe-0"},m("p",{class:"fw-bold"},e.properties.creatorPseudo)),m("div",{class:"col-4 ps-0"},e.properties.creatorID!=User.response.sub&&!1==e.properties.userHasFollowed?m("p",{class:"pt-0 text-primary",style:"cursor: pointer;",onclick:function(){User.follow(e.properties.creatorID)}},"• Suivre"):""),]),]),]),m("div",{class:"border-bottom",style:"padding-left:0;padding-right:0;"},[m("img",{class:"w-100 unselectable",src:e.properties.pictureUrl}),]),m("div",{class:"container"},[m("div",{class:"row"},[m("div",{class:"col-1 ps-0"},[m("span",{class:"material-icons unselectable ms-2",style:!0==e.properties.like?"margin-left:0;margin-right:0; color:red;":"margin-left:0;margin-right:0;",onclick:function(){Post.like(e)}},!0==e.properties.like?"favorite":"favorite_border"),]),m("div",{class:"col-4 offset-7"},[m("p",{class:"fw-bold text-end"},e.properties.likes+" Likes"),]),]),]),m("div",e.properties.body),])}),0!=Post.list.length?m("div",{class:"border rounded row row-cols-1 mt-2 bg-white"},m("div",{class:"d-flex justify-content-center"},m("button",{class:"btn",onclick:function(){Post.chargerSuivants()}},"Suivant"))):"",]))}},NewPost={url:"",body:"",listGif:[],isShow:!1,search:function(e){grab_data(e)},view:function(){if(!0==this.isShow)return this.url="",this.body="",m("div",{id:"newPost"},[m("div",{class:"fondTransparent",onclick:function(){NewPost.hide()}}),m("div",{class:"overlayDiv centered rounded onTop bg-light"},[m("div",{class:"centered-width"},m("p",{class:"text-justify fw-bold",style:{"font-family":"&quot","font-size":"25px"}},"Cr\xe9er une publication")),m("div",{class:"row overlayContainer centered"},[m("div",{class:"col-8 bg-body border",id:"url"},[m("textarea",{value:NewPost.url,class:"form-control textArea",rows:"8",placeholder:"Saisir une url..."}),m("div",m("div",{class:"input-group input-group-sm mb-3"},[m("div",{class:"input-group-prepend"},m("span",{class:"input-group-text",id:"inputGroup-sizing-sm"},"GIF")),m("input",{oninput:function(){NewPost.search(this.value)},class:"form-control",type:"text","aria-label":"Small","aria-describedby":"inputGroup-sizing-sm"})])),m("div",{class:"container",id:"gifs"},m("div",{class:"row"},[NewPost.listGif.map(function(e){return m("div",{class:"col-3 p-0"},m("img",{src:e,style:{"max-width":"100%"},onclick:function(){NewPost.url=this.src}}))})]))]),m("div",{class:"col-4 bg-body border",id:"infos"},m("div",{class:"row row-cols-1"},[m("div",{class:"col mt-2 d-flex align-items-center",id:"sender"},[m("img",{class:"iconProfile",src:User.response.picture}),m("h4",{class:"fw-bold ms-2"},User.response.given_name)]),m("div",{class:"col mt-1",id:"description"},m("textarea",{oninput:function(){NewPost.body=this.value},class:"form-control textArea",id:"textAreaDescription",rows:"8",placeholder:"Ajoutez une l\xe9gende..."})),m("div",{class:"col mt-1",id:"send",style:{"text-align":"end"}},m("button",{class:"btn border",onclick:function(){NewPost.post()}},"Partager"))]))])])])},show:function(){User.isLoged()&&(this.isShow=!0,m.redraw())},hide:function(){this.isShow=!1,m.redraw()},post:function(){return m.request({method:"POST",url:"api/apiTinyGram/v1/postPublication",params:{access_token:User.getAccessToken(),pictureURL:NewPost.url,body:NewPost.body}}).then(function(e){NewPost.hide()})}};function httpGetAsync(e,s){var i=new XMLHttpRequest;i.onreadystatechange=function(){4==i.readyState&&200==i.status?s(i.responseText):NewPost.listGif=[]},i.open("GET",e,!0),i.send(null)}function tenorCallback_search(e){top_10_gifs=JSON.parse(e).results,document.getElementById("a"),list=[],top_10_gifs.forEach(e=>{list.push(e.media_formats.nanogif.url)}),NewPost.listGif=list,m.redraw()}function grab_data(e){httpGetAsync("https://tenor.googleapis.com/v2/search?q="+e+"&key=AIzaSyCYWyCpUG2S6Dq-l_5BOYwLai_nAyxZ0pY&client_key=web cool&limit=10",tenorCallback_search)}
