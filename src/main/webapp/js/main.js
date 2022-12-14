/**
 * URL bases
 */
const postRandomsUrl =
    "api/apiTinyGram/v1/fetchNewPostsGlobal";
const likeUrl =
    "api/apiTinyGram/v1/likePost/";
const isLikeUrl =
    "api/apiTinyGram/v1/likeState/";
const followedUrl =
    "api/apiTinyGram/v1/followState/";
const signInUrl =
    "api/apiTinyGram/v1/signIn";
const connectUrl =
    "api/apiTinyGram/v1/connect";
const userInfo =
    "api/apiTinyGram/v1/basicUserInfos/";
const followUserUrl =
    "api/apiTinyGram/v1/followUser/";
const postPublicationUrl =
    "api/apiTinyGram/v1/postPublication";
const postUserUrl =
    "api/apiTinyGram/v1/fetchUserPosts/";

/**
 * Options for the date format
 */
let options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};
/**
 * Function that allows to process the connection of a google client
 * @param {The "token" google} response
 */
function connect(response) {
    //console.log("Login");
    const responsePayload = jwt_decode(
        response.credential);
    User.init(responsePayload, response
        .credential);
    m.redraw();
}

/**
 * Component that manages the connection
 */
var Connection = {
    /**
     * The view function
     */
    view: function () {
        /**
         * If the user is logged in, "disconnection" is displayed, otherwise the google sigin 
         */
        if (User.isLoged()) {
            return m("li", {
                class: "list-unstyled dropdown"
            }, [
                m("button", {
                    class: "btn material-icons unselectable",
                    id: "iconUser",
                    "data-bs-toggle": "dropdown",
                    "aria-expanded": "false",
                    type: "button"
                },
                    m("img", {
                        class: "iconProfile",
                        src: User
                            .getUrl()
                    })),
                m("ul", {
                    class: "dropdown-menu unselectable",
                    "aria-labelledby": "navbarDropdownMenuLink"
                }, [
                    m("li",
                        m("a", {
                            class: "dropdown-item",
                            onclick: function () {
                                MainView
                                    .changeView(
                                        "profile"
                                    );
                            }
                        },
                            "Mon profil"
                        )
                    ),
                    m("li",
                        m("a", {
                            class: "dropdown-item",
                            onclick: function () {
                                MainView
                                    .changeView(
                                        "apropos"
                                    );
                            }
                        },
                            "A propos"
                        )
                    )
                ]),
            ])

        } else {
            return m("button", {
                class: "btn material-icons unselectable",
                id: "iconUser",
                "data-bs-toggle": "dropdown",
                "aria-expanded": "false",
                type: "button",
                onclick: function () {
                    User
                        .showConnectView();
                }
            },
                "account_circle"
            )
        }
    }
}

/**
 *  The component that manages the user 
 */
var User = {
    //The google response
    response: null,
    credential: null,
    //The list of the user's followers
    listFollowers: [],
    //The list of the user's follows
    listFollows: [],
    followers: 0,
    follows: 0,

    /** 
    The init function is a setter of the response 
    * @param {response} response The response from google login
    */
    init: function (response,
        credential) {
        this.response =
            response;
        this.credential =
            credential;
        User.connect()
    },

    connect: function () {

        return m.request({
            method: "PUT",
            url: connectUrl,
            params: {
                access_token: User
                    .getAccessToken()
            },
        })
            .then(function (
                result) {
                Post
                    .loadListRandom();
            })
            .catch(function (
                result) {
                User
                    .signIn();
            })
    },

    signIn: function () {
        const responsePayload =
            jwt_decode(User
                .getAccessToken()
            );
        const lname =
            responsePayload
                .family_name ===
                undefined ? "_" :
                responsePayload
                    .family_name;
        const fname =
            responsePayload
                .given_name ===
                undefined ?
                responsePayload
                    .email.split("@")[
                0] :
                responsePayload
                    .given_name;
        return m.request({
            method: "POST",
            url: signInUrl,
            params: {
                access_token: User
                    .getAccessToken(),
                pseudo: fname,
                fname: fname,
                lname: lname,
                pictureURL: responsePayload
                    .picture
            },
        })
            .then(function (
                result) {
                Post
                    .loadListRandom();
            })
            .catch(function (
                result) {
                window
                    .alert(
                        "Erreur de connexion, veuillez r??essayer"
                    );
            })
    },

    /**
     *  The function allows to fill the lists 
     */
    loadFollowersNumbers: function () {
        m.request({
            method: "GET",
            url: followedUrl +
                ":UserID",
            params: {
                access_token: User
                    .getAccessToken(),
                UserID: User
                    .getID()
            }
        })
            .then(function (
                result) {
                User.followers =
                    result
                        .properties
                        .nbFollow
            })
    },

    /**
     * Function that returns the user's access token
     * @return {String} The user's access token
     */
    getAccessToken: function () {
        return this.credential;
    },

    /**
     * Function that returns the user's picture
     * @return {String} The user's picture
     */
    getUrl: function () {
        return this.response
            .picture;
    },

    /**
     * Function that returns the user's id
     * @return {String} The user's id
     */
    getID: function () {
        return this.response
            .sub;
    },


    /**
     * Function that returns the user's name
     * @return {String} The user's name
     */
    getName: function () {
        return this.response
            .name;
    },

    /**
     * The user it is loged ?
     * @return {bool} True if loged, false otherwise
     */
    isLoged: function () {
        if (this.response !=
            null) {
            this
                .hideConnectView();
            return true;
        } else {
            this
                .showConnectView();
        }
        return false;
    },

    /**
     * Function that allows to follow the user
     * @param {User} user The user to follow
     */
    follow: function (user) {
        return m.request({
            method: "POST",
            url: followUserUrl +
                ":idUser",
            params: {
                idUser: user,
                access_token: User
                    .getAccessToken()
            }
        })
            .then(function (
                result) {
                Post.list
                    .map(
                        function (
                            item
                        ) {
                            if (item
                                .properties
                                .creatorID ==
                                user
                            ) {
                                item.properties
                                    .userHasFollowed =
                                    true
                            }
                        })
            })
    },

    showConnectView: function () {
        document.getElementById(
            "login")
            .className =
            "container centered";
    },

    hideConnectView: function () {
        document.getElementById(
            "login")
            .className = "hide";
    }

}

/**
 * The post component allows you to manage posts
 */
var Post = {
    //A list of random posts from user
    list: [],
    //List of my posts
    myList: [],
    //List of posts from people I follow
    followedList: [],
    cursor: "",

    /**
     * The function that allows you to load my post list
     */
    loadListPerso: function () {
        return m.request({
            method: "GET",
            url: postUserUrl +
                ":idUser",
            params: {
                idUser: User
                    .getID(),
                access_token: User
                    .getAccessToken()
            }
        })
            .then(function (
                result) {
                Post.myList =
                    result
                        .items,
                    Post
                        .connectLikes(
                            Post
                                .myList
                        ),
                    User
                        .loadFollowersNumbers()
            },

            )
    },

    /**
     * The function that allows you to load the list of posts 
     * (the most recent) of people I don't follow
     * Restart the cursor (is reload)
     */
    reload: function () {
        Post.cursor = "",
            Post.list = [],
            Post
                .loadListRandom()
    },

    /**
     * The function that allows you to load the list of posts 
     * (the most recent) of people I don't follow
     */
    loadListRandom: function () {
        this.chargerSuivants()
    },

    chargerSuivants: function () {
        return m.request({
            method: "GET",
            url: postRandomsUrl,
            params: {
                access_token: User
                    .getAccessToken(),
                next: Post
                    .cursor
            }
        })
            .then(function (
                result) {
                if (result.items !== undefined) {
                    Post.list.push.apply(
                        Post.list, result.items
                    ),
                        Post.connectLikes(
                            Post
                                .list
                        ),
                        Post.connectUser(
                            Post
                                .list
                        ),
                        Post.cursor = result.nextPageToken
                }
            })
    },

    connectLikes: function (list) {
        list.map(function (
            item) {
            if (item
                .properties
                .nbLikes ==
                undefined
            ) {
                //The likes 
                m.request({
                    method: "GET",
                    url: isLikeUrl +
                        ":id",
                    params: {
                        id: item
                            .key
                            .name,
                        access_token: User
                            .getAccessToken()
                    }
                })
                    .then(
                        function (
                            result
                        ) {
                            item.properties
                                .likes =
                                result
                                    .properties
                                    .nbLikes;
                            item.properties
                                .like =
                                result
                                    .properties
                                    .userHasLiked;
                        }
                    )
            }
        })
    },

    connectUser: function (list) {
        list.map(function (
            item) {
            if (item
                .properties
                .creatorURL ==
                undefined
            ) {
                //The users infos
                m.request({
                    method: "GET",
                    url: userInfo +
                        ":UserID",
                    params: {
                        UserID: item
                            .properties
                            .creatorID,
                        access_token: User
                            .getAccessToken()
                    }
                })
                    .then(
                        function (
                            result
                        ) {
                            item.properties
                                .creatorURL =
                                result
                                    .properties
                                    .pictureUrl;
                            item.properties
                                .creatorPseudo =
                                result
                                    .properties
                                    .pseudo;
                            item.properties
                                .userHasFollowed =
                                result
                                    .properties
                                    .userHasFollowed;
                        })
            }
        })
    },

    /**
     * The function that allows you to like a post
     * @param {post} post The post to like
     */
    like: function (post) {
        if (User.isLoged()) {
            if (!post.properties
                .like) {
                //Putting it in the function return is too long >1s.
                post.properties
                    .like =
                    true;

                return m
                    .request({
                        method: "POST",
                        url: likeUrl +
                            ":postId",
                        params: {
                            postId: post
                                .key
                                .name,
                            access_token: User
                                .getAccessToken()
                        }
                    })
                    .then(
                        function (
                            result
                        ) {
                            post.properties
                                .likes++;
                        })
            }
        }

    },

}

/**
 * The main component that displays either my profile or the posts
 */
var MainView = {
    //The type of the current post ("welcome": posts; "profile": profile)
    type: "welcome",

    /**
     * The view function
     */
    view: function () {
        switch (this.type) {
            case "welcome":
                return PostView
                    .view();
            case "profile":
                return ProfileView
                    .view();
            case "apropos":
                return AproposView
                    .view();
        }
    },

    /**
     * The function that allows you to change views
     * @param {view} view The type of view
     */
    changeView: function (view) {
        if (User.isLoged()) {
            if (this.type !=
                view) {
                this.type = view
            }
            if (view ==
                "profile") {
                Post
                    .loadListPerso();
            } else {
                Post
                    .loadListRandom();
            }

        }
    }

}

/**
 * The component that manages the A propos view
 */
var AproposView = {
    view: function () {
        return [
            m("div", {
                "class": "police apropos"
            },
                [
                    m("div", {
                        "class": "about-section apropos"
                    },
                        [
                            m("h1",
                                "?? propos de nous"
                            ),
                            m("p",
                                "L'??quipe cr??atrice de cette excellente, incroyable, ph??nom??nale, invraisemblable, fantastique, extraordinaire, abracadabrante, impressionnante, stup??fiante, rocambolesque, fantasmagorique application Web \"TinyGram\" est compos??e de 3 ??tudiants de Nantes Universit??. Qui sont ces membres hors du commun ?!?!?"
                            )
                        ]
                    ),
                    m("h2", {
                        "style": {
                            "text-align": "center"
                        },
                        class: "m-4"
                    },
                        "Notre ??quipe de choc"
                    ),
                    m("div", {
                        "class": "row apropos"
                    },
                        [
                            m("div", {
                                "class": "column apropos"
                            },
                                m("div", {
                                    "class": "card apropos"
                                },
                                    [
                                        m("img", {
                                            "src": "https://media.tenor.com/-DyBfnxjz3oAAAAS/kaamelott-arthur.gif",
                                            "class": "m-2"
                                        }),
                                        m("div", {
                                            "class": "container apropos"
                                        },
                                            [
                                                m("h2",
                                                    "Rodrigue Meunier"
                                                ),
                                                m("h5",
                                                    "Alias \"Rod4401\" ou \"Captaine Rillettes\""
                                                ),
                                                m("p", {
                                                    "class": "title apropos"
                                                },
                                                    "Student"
                                                ),
                                                m("p",
                                                    "Disposant d'un anglais proche de la perfection, Rodrigue Meunier a su investir corps et ??me afin de garantir une belle interface visuelle de cette application. Ce manceau a la particularit?? d'??tre un joueur professionnel Minecraft et cela en parall??le de ses ??tudes. Il est tout ?? fait capable de construire un syst??me en redstone qui scale et qui est efficace. Sa plus grande faiblesse se situe sur son t??l??phone, c'est Tiktok."
                                                ),
                                                m("p",
                                                    "rodrigue.meunier@etu.univ-nantes.fr"
                                                ),
                                                m("p",
                                                    m("button", {
                                                        "class": "button apropos"
                                                    },
                                                        "Contact"
                                                    )
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ),
                            m("div", {
                                "class": "column apropos"
                            },
                                m("div", {
                                    "class": "card apropos"
                                },
                                    [
                                        m("img", {
                                            "src": "https://media.tenor.com/OpjEv-qkRIcAAAAC/kaamelott-perceval.gif",
                                            "class": "m-2"
                                        }),
                                        m("div", {
                                            "class": "container apropos"
                                        },
                                            [
                                                m("h2",
                                                    "Quentin Gomes Dos Reis"
                                                ),
                                                m("h5",
                                                    "Alias \"ThinkIsPossible\",\"Los Portos\""
                                                ),
                                                m("p", {
                                                    "class": "title apropos"
                                                },
                                                    "Student"
                                                ),
                                                m("p",
                                                    "Cet individu poss??de une photo de profil pour le moins... particuli??rement angoissante. Cet intriguant personnage effectue depuis plus de 3 ans, la route en voiture ou en train tous les jours pour se rendre en cours ?? la fac depuis Clisson. Comment peut-on rester normal apr??s ??a...Il est aussi connu pour son implication dans le back ?? l'ombre du front et rappelle r??guli??rement ?? son camarade, le Capitaine Rillettes, que si une m??thode du back ne fonctionne pas, c'est qu'il faut d'abord l'appeler correctement avant de blamer le back, bref affaire ?? suivre..."
                                                ),
                                                m("p",
                                                    "quentin.gomes-dos-reis@etu.univ-nantes.fr"
                                                ),
                                                m("p",
                                                    m("button", {
                                                        "class": "button apropos"
                                                    },
                                                        "Contact"
                                                    )
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ),
                            m("div", {
                                "class": "column apropos"
                            },
                                m("div", {
                                    "class": "card apropos"
                                },
                                    [
                                        m("img", {
                                            "src": "https://media.tenor.com/k0b77ukWmA0AAAAM/kaamelott-merlin.gif",
                                            "class": "m-2"
                                        }),
                                        m("div", {
                                            "class": "container apropos"
                                        },
                                            [
                                                m("h2",
                                                    "Valentin Goubon"
                                                ),
                                                m("h5",
                                                    "Alias \"TinkyValou\""
                                                ),
                                                m("p", {
                                                    "class": "title apropos"
                                                },
                                                    "Student"
                                                ),
                                                m("p",
                                                    "Alors lui on se demande comment il est arriv?? l??. Plus efficace pour organiser un laser-game, ou bien pour devenir aussi puissant que Jotaro Kujo, Valentin a la particularit?? aussi de ne pas toujours venir en cours, pour des probl??mes de r??veil. Nous verrons bien si les quelques s??ances loup??es ne lui seront pas indispensables dans sa r??ussite scolaire. Le d??l??gu?? de la promotion ALMA va devoir s'accrocher !"
                                                ),
                                                m("p",
                                                    "valentin.goubon@etu.univ-nantes.fr"
                                                ),
                                                m("p",
                                                    m("button", {
                                                        "class": "button apropos"
                                                    },
                                                        "Contact"
                                                    )
                                                )
                                            ]
                                        )
                                    ]
                                )
                            )
                        ]
                    ),
                    m("div", {
                        "class": "about-section apropos"
                    },
                        [
                            m("h1",
                                "Lien vers notre projet"
                            ),
                            m("p",
                                [
                                    " Voici un lien vers notre projet Open Source, afin que vous puissiez admirer notre oeuvre. Si vous rencontrez le moindre souci sur notre application, ce qui est techniquement impossible, n'h??sitez pas ?? contacter monsieur ",
                                    m("a", {
                                        "href": "Pascal.Molli@univ-nantes.fr"
                                    },
                                        "Pascal Molli"
                                    ),
                                    ". C'est notre directeur technique, il vous garantira une assistance hors du commun vous permettant de profiter de la meilleure exp??rience possible afin de passer une bonne procrastination. Github : ",
                                    m("a", {
                                        "href": "mailto:https://github.com/Rod4401/TinyGram"
                                    },
                                        "TinyGram"
                                    )
                                ]
                            ),
                            m("h1",
                                "R??sultats sur la scalabilit?? de notre projet"
                            ),
                            m("div",
                                [
                                    m("h3", {"class":"mb-3 mt-3"}, "Courbe cumul??e croissante de la latence"),
                                    m("img", {
                                        "src": "img/courbeCumul??eCroissante.png",
                                        "class": "mw-100",
                                    }),
                                    m("h3", {"class":"mb-3 mt-3"},"Courbe de la densit?? de la latence"),
                                    m("img", {
                                        "src": "img/courbeDensit??.png",
                                        "class": "mw-100",
                                    }),
                                    m("h3", {"class":"mb-3 mt-3"},"Latences d??taill??es en fonction du pourcentage"),
                                    m("img", {"src": "img/LatenceDetaill??e.png"}),
                                    m("p", {"class":"text-break"}, "D'apr??s les rapports de Google. On peut voir que le cap des 500ms symbolique est d??pass?? au del?? de 65% des requ??tes. ??tant donn??e que nous n'avons pas execut?? nos requ??tes sur des millions d'utilisateurs, la moindre latence (une personne ayant une connexion pour le moins douteuse) nous fait d??faut. On ne peut pas conclure de rapport sur une aussi courte p??riode mais on voit que pour un nombre assez restraint d'utilisateur, les requ??tes sont d??j?? \"correctes\""),
                                ]
                            )
                        ]
                    )
                ]
            )
        ]
    }
}

/**
 * The component that manages the profile view
 */
var ProfileView = {
    listView: [],

    //The type of user displayed (followers or follows)
    type: "followers",

    //For the navBar, user rendering is done via an "active" class,
    //"passive" is the class for the unselected type
    active: "d-flex align-items-center justify-content-center unselectable border-0 border-top border-dark bg-light ms-2",
    passive: "d-flex align-items-center justify-content-center unselectable border-0 bg-light ms-2",

    /**
     * The view function
     */
    view: function () {
        return m("div", {
            class: "container"
        }, m("div", {
            class: "row row-cols-1 row-cols-lg-3"
        }, [
            m("div", {
                id: "profileInfos",
                class: "col-lg-4 mb-2 mt-3 bg-light offset-lg-2 h-25"
            }, [
                m("div", {
                    class: "container pb-2 border-bottom"
                },
                    m("div", {
                        class: "row"
                    },
                        [
                            m("div", {
                                class: "col-3 postsProfilePicture w-25"
                            },
                                m("img", {
                                    style: "border-radius: 50%;",
                                    src: User
                                        .getUrl(),
                                    alt: "img_user",
                                    width: "100%",
                                    height: "100%",
                                    class: "unselectable"
                                })
                            ),
                            m("div", {
                                class: "col-9 row-cols-1 pe-0"
                            },
                                [
                                    m("div", {
                                        class: "h-50 align-items-center d-flex"
                                    },
                                        m("h4",
                                            User
                                                .getName()
                                        )
                                    ),
                                    m("div", {
                                        class: "h-50 align-items-right d-flex"
                                    },
                                        [m("span", {
                                            class: "me-4"
                                        },
                                            User
                                                .followers +
                                            " followers"
                                        )]
                                    )
                                ]
                            )
                        ]
                    )
                ),
                m("div", {
                    class: "rounded h-100"
                },
                    [
                        ProfileView
                            .listView
                            .map(
                                function (
                                    item
                                ) {
                                    return m(
                                        "p", {
                                        class: "fw-bold"
                                    },
                                        item
                                    );
                                }
                            )
                    ]
                )

            ]), m(
                "div", {
                class: "col-lg-4 me-2 pe-0 ps-0 mt-3 mb-2 offset-lg-1 bg-light",
                id: "profilePosts"
            },
                m("div", {
                    class: "container"
                },
                    m("div", {
                        class: "row"
                    },
                        [
                            Post
                                .myList
                                .map(
                                    function (
                                        item
                                    ) {

                                        return m(
                                            'div', {
                                            class: "border rounded row row-cols-1 mt-2 bg-white",
                                            id: item
                                                .key
                                                .name,
                                        },
                                            [
                                                //IMAGE
                                                m('div', {
                                                    class: "border-bottom mt-2",
                                                    style: "padding-left:0;padding-right:0;"
                                                },
                                                    [
                                                        m('img', {
                                                            class: "w-100 unselectable",
                                                            src: item
                                                                .properties
                                                                .pictureUrl
                                                        }),
                                                    ]
                                                ),

                                                //LIKE
                                                m('div', {
                                                    class: "container mt-1"
                                                },
                                                    [
                                                        m('div', {
                                                            class: "row"
                                                        },
                                                            [
                                                                m('div', {
                                                                    class: "col-1 ps-0"
                                                                },
                                                                    [
                                                                        m('span', {
                                                                            class: "material-icons unselectable ms-2",
                                                                            style: item
                                                                                .properties
                                                                                .like ==
                                                                                true ?
                                                                                "margin-left:0;margin-right:0; color:red;" :
                                                                                "margin-left:0;margin-right:0;",
                                                                            onclick: function () {
                                                                                Post.like(
                                                                                    item,
                                                                                )
                                                                            }
                                                                        },
                                                                            item
                                                                                .properties
                                                                                .like ==
                                                                                true ?
                                                                                "favorite" :
                                                                                "favorite_border",
                                                                        ),
                                                                    ]
                                                                ),
                                                                m('div', {
                                                                    class: "col-4 offset-7"
                                                                },
                                                                    [
                                                                        m('p', {
                                                                            class: "fw-bold text-end"
                                                                        },
                                                                            item
                                                                                .properties
                                                                                .likes +
                                                                            " Likes"
                                                                        ),
                                                                    ]
                                                                ),
                                                            ]
                                                        ),
                                                    ]
                                                ),

                                                // DESCRIPTION
                                                m('div',
                                                    [
                                                        m('h6', {
                                                            class: "text-break mb-0 lead",
                                                            style: "font-size:15;"
                                                        },
                                                            new Date(
                                                                item
                                                                    .properties
                                                                    .date
                                                            )
                                                                .toLocaleDateString(
                                                                    "fr-FR",
                                                                    options
                                                                )
                                                        ),
                                                        m('p', {
                                                            class: "text-break"
                                                        },
                                                            item
                                                                .properties
                                                                .body
                                                        )
                                                    ]
                                                ),

                                            ]
                                        )
                                    }
                                )
                        ]
                    )
                )
            )
        ]));
    },

    /**
     * The function that allows you to change views (followers or follows)
     * @param {type} type The new type
     */
    changeView: function (type) {
        //console.log(type);
        this.type = type;
        this.search("");
    },

    /**
     * The function that allows you to search for users based on a pattern (name)
     *  @param {name} name The name to search
     */
    search: function (name) {
        this.listView = (this
            .type ==
            "followers" ?
            User
                .listFollowers :
            User.listFollows
        )
            .filter(
                username =>
                    username
                        .includes(name)
            );
        m.redraw();
    }

}

/**
 * The component that manages the post view
 */
var PostView = {

    /**
     * Function that returns to the top of page
     */
    goTop: function () {
        //console.log("Go on top");
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    },

    /**
     * The view function
     */
    view: function () {
        return m("div", {
            class: "container d-flex justify-content-center",
            style: "width:400px;"
        }, m('div', [
            Post
                .list
                .map(
                    function (
                        item
                    ) {
                        return m(
                            'div', {
                            class: "border rounded row row-cols-1 mt-2 bg-white",
                            id: item
                                .key
                                .name,
                        },
                            [
                                // ENTETE
                                m('div', {
                                    class: "mt-2 ps-0 border-bottom col"
                                },
                                    [
                                        m('div', {
                                            class: "container mb-1"
                                        },
                                            [
                                                m('div', {
                                                    class: "row"
                                                },
                                                    [
                                                        m('div', {
                                                            class: "col-1"
                                                        },
                                                            m('img', {
                                                                class: "iconProfile unselectable",
                                                                onclick: function () {
                                                                    User.follow(
                                                                        item
                                                                            .properties
                                                                            .creatorID,
                                                                    )
                                                                },
                                                                src: item
                                                                    .properties
                                                                    .creatorURL
                                                            })
                                                        ),
                                                        m('div', {
                                                            class: "col-8"
                                                        },
                                                            [m('span', {
                                                                class: "fw-bold me-1"
                                                            },
                                                                item
                                                                    .properties
                                                                    .creatorPseudo
                                                            ),

                                                            item
                                                                .properties
                                                                .creatorID !=
                                                                User
                                                                    .getID() &&
                                                                item
                                                                    .properties
                                                                    .userHasFollowed ==
                                                                false ?
                                                                (m('span', {
                                                                    class: "pt-0 text-primary",
                                                                    style: "cursor: pointer;",
                                                                    onclick: function () {
                                                                        User.follow(
                                                                            item
                                                                                .properties
                                                                                .creatorID
                                                                        )
                                                                    }
                                                                },
                                                                    "??? Suivre"
                                                                )) :
                                                                "",
                                                            ]
                                                        )
                                                    ]
                                                ),
                                            ]
                                        ),
                                    ]
                                ),
                                //IMAGE
                                m('div', {
                                    class: "border-bottom",
                                    style: "padding-left:0;padding-right:0;"
                                },
                                    [
                                        m('img', {
                                            class: "w-100 unselectable",
                                            src: item
                                                .properties
                                                .pictureUrl
                                        }),
                                    ]
                                ),

                                //LIKE
                                m('div', {
                                    class: "container mt-1"
                                },
                                    [
                                        m('div', {
                                            class: "row"
                                        },
                                            [
                                                m('div', {
                                                    class: "col-1 ps-0"
                                                },
                                                    [
                                                        m('span', {
                                                            class: "material-icons unselectable ms-2",
                                                            style: item
                                                                .properties
                                                                .like ==
                                                                true ?
                                                                "margin-left:0;margin-right:0; color:red;" :
                                                                "margin-left:0;margin-right:0;",
                                                            onclick: function () {
                                                                Post.like(
                                                                    item,
                                                                )
                                                            }
                                                        },
                                                            item
                                                                .properties
                                                                .like ==
                                                                true ?
                                                                "favorite" :
                                                                "favorite_border",
                                                        ),
                                                    ]
                                                ),
                                                m('div', {
                                                    class: "col-4 offset-7"
                                                },
                                                    [
                                                        m('p', {
                                                            class: "fw-bold text-end"
                                                        },
                                                            item
                                                                .properties
                                                                .likes +
                                                            " Likes"
                                                        ),
                                                    ]
                                                ),
                                            ]
                                        ),
                                    ]
                                ),

                                // DESCRIPTION
                                m('div',
                                    [
                                        m('h6', {
                                            class: "text-break mb-0 lead",
                                            style: "font-size:15;"
                                        },
                                            new Date(
                                                item
                                                    .properties
                                                    .date
                                            )
                                                .toLocaleDateString(
                                                    "fr-FR",
                                                    options
                                                )
                                        ),
                                        m('p', {
                                            class: "text-break"
                                        },
                                            item
                                                .properties
                                                .body
                                        )
                                    ]
                                ),

                            ]
                        )
                    }),
            Post
                .list
                .length !=
                0 ?
                (m("div", {
                    "class": "border rounded row row-cols-1 mt-2 bg-white"
                },
                    m("div", {
                        "class": "d-flex justify-content-center"
                    },
                        m("button", {
                            "class": "btn",
                            onclick: function () {
                                Post
                                    .chargerSuivants();
                            }
                        },
                            "Suivant"
                        )
                    )
                )) : "",
        ]))
    }
}

/**
 * The component that allows you to manage the div to create a post
 */
var NewPost = {
    url: "",
    body: "",
    listGif: [],
    isShow: false,

    search: function (text) {
        grab_data(text);
    },

    view: function () {
        if (this.isShow ==
            true) {
            this.url = "";
            this.body = "";
            return m("div", {
                "id": "newPost"
            },
                [
                    m("div", {
                        "class": "fondTransparent",
                        onclick: function () {
                            NewPost
                                .hide()
                        }
                    }),
                    m("div", {
                        "class": "overlayDiv centered rounded onTop bg-light"
                    },
                        [
                            m("div", {
                                "class": "centered-width"
                            }
                            ),
                            m("div", {
                                "class": "row overlayContainer centered"
                            },
                                [
                                    m("div", {
                                        "class": "col-8 bg-body border",
                                        "id": "url"
                                    },
                                        [
                                            m("textarea", {
                                                "oninput": function () {
                                                    NewPost
                                                        .url =
                                                        this
                                                            .value
                                                },
                                                value: NewPost
                                                    .url,
                                                "class": "form-control textArea",
                                                "rows": "8",
                                                "placeholder": "Saisir une url..."
                                            }),
                                            m("div",
                                                m("div", {
                                                    "class": "input-group input-group-sm mb-3"
                                                },
                                                    [
                                                        m("div", {
                                                            "class": "input-group-prepend"
                                                        },
                                                            m("span", {
                                                                "class": "input-group-text",
                                                                "id": "inputGroup-sizing-sm"
                                                            },
                                                                "GIF"
                                                            )
                                                        ),
                                                        m("input", {
                                                            "oninput": function () {
                                                                NewPost
                                                                    .search(
                                                                        this
                                                                            .value
                                                                    )
                                                            },
                                                            "class": "form-control",
                                                            "type": "text",
                                                            "aria-label": "Small",
                                                            "aria-describedby": "inputGroup-sizing-sm"
                                                        })
                                                    ]
                                                )
                                            ),
                                            m("div", {
                                                "class": "container",
                                                "id": "gifs"
                                            },
                                                m("div", {
                                                    "class": "row"
                                                },
                                                    [
                                                        NewPost
                                                            .listGif
                                                            .map(
                                                                function (
                                                                    item
                                                                ) {
                                                                    return m(
                                                                        "div", {
                                                                        "class": "col-3 p-0"
                                                                    },
                                                                        m("img", {
                                                                            "src": item,
                                                                            "style": {
                                                                                "max-width": "100%"
                                                                            },
                                                                            onclick: function () {
                                                                                NewPost
                                                                                    .url =
                                                                                    this
                                                                                        .src
                                                                            }
                                                                        })
                                                                    )
                                                                }
                                                            )
                                                    ]
                                                )
                                            )
                                        ]
                                    ),
                                    m("div", {
                                        "class": "col-4 bg-body border",
                                        "id": "infos"
                                    },
                                        m("div", {
                                            "class": "row row-cols-1"
                                        },
                                            [
                                                m("div", {
                                                    "class": "col mt-2 d-flex align-items-center",
                                                    "id": "sender"
                                                },
                                                    [
                                                        m("img", {
                                                            "class": "iconProfile",
                                                            "src": User
                                                                .response
                                                                .picture
                                                        }),
                                                        m("h4", {
                                                            "class": "fw-bold ms-2"
                                                        },
                                                            User
                                                                .response
                                                                .given_name
                                                        )
                                                    ]
                                                ),
                                                m("div", {
                                                    "class": "col mt-1",
                                                    "id": "description"
                                                },
                                                    m("textarea", {
                                                        "oninput": function () {
                                                            NewPost
                                                                .body =
                                                                this
                                                                    .value
                                                        },
                                                        "class": "form-control textArea",
                                                        "id": "textAreaDescription",
                                                        "rows": "8",
                                                        "placeholder": "Ajoutez une l??gende..."
                                                    })
                                                ),
                                                m("div", {
                                                    "class": "col mt-1",
                                                    "id": "send",
                                                    "style": {
                                                        "text-align": "end"
                                                    }
                                                },
                                                    m("button", {
                                                        "class": "btn border",
                                                        onclick: function () {
                                                            NewPost
                                                                .post();
                                                        }
                                                    },
                                                        "Partager"
                                                    )
                                                )
                                            ]
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ]
            );
        }
    },

    /**
     * The function that displays it
     * The user must be logged in
     */
    show: function () {
        if (User.isLoged()) {
            this.isShow = true;
            m.redraw();
        }
    },

    /**
     * The function that hides it
     */
    hide: function () {
        this.isShow = false;
        m.redraw();
    },

    /**
     * The function that post the post
     * It called after the user click on "Partager"
     */
    post: function () {
        //Post ajout??
        NewPost.hide();
        return m.request({
            method: "POST",
            url: postPublicationUrl,
            params: {
                access_token: User
                    .getAccessToken(),
                pictureURL: NewPost
                    .url,
                body: NewPost
                    .body
            }
        })
            .then(function (
                result) {
                Post
                    .reload();
            })
    }

}

//GIF
// url Async requesting function
function httpGetAsync(theUrl,
    callback) {
    // create the request object
    var xmlHttp = new XMLHttpRequest();

    // set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange =
        function () {
            if (xmlHttp.readyState ==
                4 && xmlHttp.status ==
                200) {
                callback(xmlHttp
                    .responseText);
            } else {
                NewPost.listGif = [];
            }
        }

    // open as a GET call, pass in the url and set async = True
    xmlHttp.open("GET", theUrl, true);

    // call send with no params as they were passed in on the url string
    xmlHttp.send(null);
    return;
}



// callback for the top 8 GIFs of search
function tenorCallback_search(
    responsetext) {
    // Parse the JSON response
    var response_objects = JSON.parse(
        responsetext);

    top_16_gifs = response_objects[
        "results"];

    // load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (gif)
    var d = document.getElementById(
        "a");
    list = [];
    top_16_gifs.forEach(element => {
        list.push(element[
            "media_formats"
        ]["nanogif"]
        ["url"]);
    });
    NewPost.listGif = list;
    m.redraw();

    return;

}

// function to call the featured and category endpoints
function grab_data(text) {
    // set the apikey and limit
    var apikey =
        "AIzaSyCYWyCpUG2S6Dq-l_5BOYwLai_nAyxZ0pY";
    var clientkey = "web cool";
    var lmt = 16;

    // test search term
    var search_term = text;

    // using default locale of en_US
    var search_url =
        "https://tenor.googleapis.com/v2/search?q=" +
        search_term + "&key=" +
        apikey + "&client_key=" +
        clientkey + "&limit=" + lmt;

    httpGetAsync(search_url,
        tenorCallback_search);

    // data will be loaded by each call's callback
    return;
}
