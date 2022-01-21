var app = angular.module("reviewapp", ["ngRoute", "ngAnimate"])
app.config(function($routeProvider)
{
  $routeProvider
    .when("/movie", {
      templateUrl: "movie.html",
      controller: "moviectrl"
    })
    .when("/reviews", {
      templateUrl: "reviews.html",
      controller: "reviewsctrl"
    })
    .otherwise({
      templateUrl: "browser.html",
      controller: "browserctrl"
    })
})
app.factory("dbservice", function($http, $q)
{
  const dbname = "moviedb.json"
  let data = []
  const dbservice = {}
  const deferred = $q.defer()
  let movies = []
  dbservice.loaddb = function()
    {
      $http.get(dbname)
        .success(function(response)
        {
          data = response
          movies = response.moviedb.movies
          deferred.resolve()
        }, function(response)
        {
          alert("Tietokantaongelma")
          deferred.resolve()
        })
      return deferred.promise
    }
  dbservice.getmovies = function()
    {
      return movies
    }
  dbservice.savedb = function()
    {
      const deferred = $q.defer()
      data.moviedb.movies = movies
      $http.post("dbserver.php", data)
        .success(function(response)
        {
          alert("Kiitos arvostelustasi!")
          deferred.resolve
        }, function(response)
        {
          alert("Arvostelun tallennus epäonnistui.")
          deferred.resolve
        })
      return deferred.promise
    }
  return dbservice
})
app.factory("moviepicker", function()
{
  let currentmovie = 0
  const moviepicker = {}
  moviepicker.changemovie = function(movieid)
    {
      currentmovie = movieid
    }
  moviepicker.getcurrentmovie = function()
    {
      return currentmovie
    }
  return moviepicker
})
app.service("validator", function()
{
  this.validatestring = function(input)
    {
      return !( input == null || input === "" )
    }
})
app.factory("reviewerpicker", function()
{
  let currentreviewer = ""
  const reviewerpicker = {}
  reviewerpicker.changereviewer = function(reviewer)
    {
      currentreviewer = reviewer
    }
  reviewerpicker.getcurrentreviewer = function()
    {
      return currentreviewer
    }
  return reviewerpicker
})
app.controller("reviewctrl", function($scope, moviepicker, dbservice, validator)
{
  $scope.allowreview = false
  $scope.disallowreview = true
  $scope.showback = false
  $scope.hideback = true
  dbservice.loaddb()
    .then(function()
    {
      $scope.movies = dbservice.getmovies()
    })
  $scope.submitreview = function()
    {
      if (moviepicker.getcurrentmovie() === -1)
        {
          return
        }
      if (!validator.validatestring($scope.username))
        {
          alert("Nimimerkki tulee täyttää")
          return
        }
      if (!validator.validatestring($scope.score))
        {
          alert("Arvosana tulee valita")
          return
        }
      if (!validator.validatestring($scope.reviewtext))
        {
          alert("Kirjoita arvostelukenttään jotakin")
          return
        }
      const review = {
        "review": {
          "reviewer": $scope.username,
          "reviewscore": $scope.score,
          "reviewtext": $scope.reviewtext
        }
      }
      $scope.movies[moviepicker.getcurrentmovie()].reviews.push(review)
      let averageScore = 0
      let scoreCount = 0
      for (const i in $scope.movies[moviepicker.getcurrentmovie()].reviews)
        {
          scoreCount++
          averageScore += parseInt($scope.movies[moviepicker.getcurrentmovie()].reviews[i].review.reviewscore)
        }
      if (scoreCount > 0)
        {
          averageScore /= scoreCount
        }
      $scope.movies[moviepicker.getcurrentmovie()].score = averageScore.toString()
      dbservice.savedb()
        .then(function()
        {
        })
    }
})
app.controller("reviewsctrl", function($scope, reviewerpicker, dbservice)
{
  $scope.reviewermoviefilter = function(movie)
    {
      for (const i in movie.reviews)
        {
          if (movie.reviews[i].review.reviewer === reviewerpicker.getcurrentreviewer())
            {
              return true
            }
        }
      return false
    }
  $scope.reviewerreviewfilter = function(review)
    {
      return ( review.review.reviewer === reviewerpicker.getcurrentreviewer() )
    }
  $scope.$parent.allowreview = false
  $scope.$parent.disallowreview = true
  $scope.$parent.showback = true
  $scope.$parent.hideback = false
  $scope.reviewer = reviewerpicker.getcurrentreviewer()
})
app.controller("moviectrl", function($scope, moviepicker, reviewerpicker, dbservice)
{
  $scope.moviefilter = function(movie)
    {
      return ( movie.id === moviepicker.getcurrentmovie() )
    }
  $scope.pickreviewer = function(reviewer)
    {
      reviewerpicker.changereviewer(reviewer)
    }
  $scope.$parent.allowreview = true
  $scope.$parent.disallowreview = false
  $scope.$parent.showback = true
  $scope.$parent.hideback = false
})
app.controller("browserctrl", function($scope, $http, moviepicker, dbservice)
{
  $scope.viewmovie = function(movieid)
    {
      moviepicker.changemovie(movieid)
    }
  $scope.$parent.allowreview = false
  $scope.$parent.disallowreview = true
  $scope.$parent.showback = false
  $scope.$parent.hideback = true
  moviepicker.changemovie(-1)
})

