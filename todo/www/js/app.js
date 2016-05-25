angular.module('todo', ['ionic'])
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
.factory('Projects', function() {
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, $ionicActionSheet, Projects, $ionicSideMenuDelegate) {

  // Load or initialize projects
  $scope.projects = Projects.all();
  
  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];
  
  // A utility function for creating a new project - on clicking create in popup
  // with the given projectTitle
  $scope.createProject = function(projectTitle) {
	$scope.projModal.hide();
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  }

  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });
  
   // Create our project modal
  $ionicModal.fromTemplateUrl('new-proj.html', function(modal) {
    $scope.projModal = modal;
  }, {
    scope: $scope
  });
  
	// Create our task delete modal
	$ionicModal.fromTemplateUrl('del-task.html', {
	scope: $scope,
	animation: 'slide-in-up'
  }).then(function(modal) {
	$scope.delModal = modal;
  });
  
  	// Create our edit task modal
  $ionicModal.fromTemplateUrl('edit-task.html', function(modal) {
    $scope.updateModal = modal;
  }, {
    scope: $scope
  });
  
  // Create our project delete task modal
  $ionicModal.fromTemplateUrl('del-proj.html', function(modal) {
    $scope.delProjModal = modal;
  }, {
    scope: $scope
  });

  $scope.createTask = function(task) {
	console.log(task);
    if(!$scope.activeProject || !task) {
      return;
    }
	console.log($scope.activeProject);
    $scope.activeProject.tasks.push({
      title: task.title
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);
    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  
  $scope.newProject = function() {
    $scope.projModal.show();
  };

  $scope.closeNewProject = function() {
    $scope.projModal.hide();
  }


  // Try to create the first project, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.projects.length == 0) {
      while(true) {
		  //$scope.newProject();
        var projectTitle = prompt('Your first project title:');
        if(projectTitle) {
          $scope.createProject(projectTitle);
          break;
        }
      }
    }
  });

	  
  $scope.currentTask = "";

  $scope.delTask = function(task) {
	$scope.delModal.show();
	$scope.currentTask  = task;
  };
	
  $scope.delProj = function(proj) {
	$scope.delProjModal.show();
  };
  
  $scope.closeDelProjModal = function(){
	  $scope.delProjModal.hide();
  }
	  
  $scope.closeDelModal = function() {
	$scope.delModal.hide();
  };
  //todo
  $scope.deleteProject = function(){
	  $scope.closeDelProjModal();
	  if(!$scope.activeProject) {
		  return;
	  }
	  var index = $scope.projects.indexOf($scope.activeProject);
	  $scope.projects.splice(index, 1);
	  $scope.activeProject = $scope.projects[0];
	  // Inefficient, but save all the projects
	  Projects.save($scope.projects);
  }
	  
  $scope.deleteTask = function(task) {
	if(task){
		$scope.currentTask = task;
	}
	if(!$scope.activeProject || !$scope.currentTask) {
	  return;
	}
	var index = $scope.activeProject.tasks.indexOf($scope.currentTask);
	$scope.activeProject.tasks.splice(index, 1);
	$scope.delModal.hide();

	// Inefficient, but save all the projects
	Projects.save($scope.projects);
  };
  
	
	 // Triggered on a button click on task name
	$scope.showActionSheet = function(task) {
		var hideSheet = $ionicActionSheet.show({
			 buttons: [
			   { text: 'Edit' }
			 ],
			 destructiveText: 'Delete',
			 titleText: 'Update Todo',
			 cancelText: 'Cancel',
			 buttonClicked: function(index) {
				 $scope.currentTask = task;
				console.log(index);
				$scope.updateModal.show();
			   return true;
			 },
			 destructiveButtonClicked: function(){
				 console.log(task);
				 $scope.deleteTask(task);
				 hideSheet();
			 }
		});
	}

  $scope.updateTask = function(task) {
    if(!$scope.activeProject || !task) {
      return;
    }
	var curIndex = $scope.activeProject.tasks.indexOf($scope.currentTask);
	$scope.activeProject.tasks[curIndex].title = task.title;

    $scope.updateModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);
  };

  $scope.closeEditModal = function() {
    $scope.updateModal.hide();
  }
});