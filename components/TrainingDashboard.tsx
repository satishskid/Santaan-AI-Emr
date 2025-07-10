import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Card, Badge, Button } from './ui/DesignSystem';
import { 
  BookOpenIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  ClockIcon,
  StarIcon,
  TrophyIcon,
  AcademicCapIcon,
  BarChart3Icon,
  UserIcon
} from './icons';
import { 
  TrainingService, 
  TrainingModule as TrainingModuleType,
  TrainingCategory
} from '../services/trainingService';
import TrainingModule from './TrainingModule';

interface TrainingDashboardProps {
  userId: string;
  userRole: UserRole;
  userName: string;
}

const TrainingDashboard: React.FC<TrainingDashboardProps> = ({
  userId,
  userRole,
  userName
}) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [modules, setModules] = useState<TrainingModuleType[]>([]);
  const [trainingSummary, setTrainingSummary] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | 'all'>('all');

  useEffect(() => {
    const allModules = TrainingService.getTrainingModules(userRole);
    setModules(allModules);
    
    const summary = TrainingService.getTrainingSummary(userId);
    setTrainingSummary(summary);
    
    const recs = TrainingService.getTrainingRecommendations(userId, userRole);
    setRecommendations(recs);
  }, [userId, userRole]);

  const handleModuleComplete = (moduleId: string, score?: number) => {
    // Refresh data after completion
    const summary = TrainingService.getTrainingSummary(userId);
    setTrainingSummary(summary);
    
    const recs = TrainingService.getTrainingRecommendations(userId, userRole);
    setRecommendations(recs);
    
    setActiveModule(null);
  };

  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(module => module.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'info';
    }
  };

  const getCategoryIcon = (category: TrainingCategory) => {
    switch (category) {
      case TrainingCategory.DataTypes: return BookOpenIcon;
      case TrainingCategory.FieldSemantics: return StarIcon;
      case TrainingCategory.Workflow: return PlayIcon;
      case TrainingCategory.Correlations: return BarChart3Icon;
      case TrainingCategory.SystemNavigation: return UserIcon;
      default: return BookOpenIcon;
    }
  };

  if (activeModule) {
    return (
      <TrainingModule
        moduleId={activeModule}
        userId={userId}
        userRole={userRole}
        onComplete={handleModuleComplete}
        onExit={() => setActiveModule(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {userName}! Continue your IVF EMR training journey.
          </p>
        </div>
        <Badge variant="info" className="flex items-center space-x-1">
          <UserIcon className="h-4 w-4" />
          <span>{userRole}</span>
        </Badge>
      </div>

      {/* Training Summary */}
      {trainingSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="elevated" className="p-4 text-center">
            <BookOpenIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trainingSummary.totalModules}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Modules</div>
          </Card>
          
          <Card variant="elevated" className="p-4 text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trainingSummary.completedModules}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </Card>
          
          <Card variant="elevated" className="p-4 text-center">
            <PlayIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trainingSummary.inProgressModules}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </Card>
          
          <Card variant="elevated" className="p-4 text-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trainingSummary.certificationsEarned}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Certifications</div>
          </Card>
          
          <Card variant="elevated" className="p-4 text-center">
            <ClockIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trainingSummary.totalHoursSpent}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hours Spent</div>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Recommended for You
          </h2>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <Card variant="elevated" className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
            size="sm"
          >
            All Categories
          </Button>
          {Object.values(TrainingCategory).map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
            >
              {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Button>
          ))}
        </div>
      </Card>

      {/* Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const isCompleted = TrainingService.isModuleCompleted(module.id, userId);
          const progress = TrainingService.getProgress(module.id, userId);
          const CategoryIcon = getCategoryIcon(module.category);
          
          return (
            <Card key={module.id} variant="elevated" className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="h-6 w-6 text-blue-500" />
                  <Badge variant={getDifficultyColor(module.difficulty)} size="sm">
                    {module.difficulty}
                  </Badge>
                </div>
                {isCompleted && (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {module.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {module.description}
              </p>
              
              <div className="space-y-3">
                {/* Progress Bar */}
                {progress > 0 && !isCompleted && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Module Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{module.estimatedDuration} min</span>
                  </div>
                  {module.certification && (
                    <div className="flex items-center space-x-1">
                      <AcademicCapIcon className="h-4 w-4" />
                      <span>Certification</span>
                    </div>
                  )}
                </div>
                
                {/* Learning Objectives */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Learning Objectives:
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {module.learningObjectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                    {module.learningObjectives.length > 2 && (
                      <li className="text-gray-500">
                        +{module.learningObjectives.length - 2} more...
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Prerequisites */}
                {module.prerequisites.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Prerequisites:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {module.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <Button
                  onClick={() => setActiveModule(module.id)}
                  variant="primary"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Review</span>
                    </>
                  ) : progress > 0 ? (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      <span>Continue</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      <span>Start</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <Card variant="elevated" className="p-12 text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No modules found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No training modules match the selected category. Try selecting a different category.
          </p>
        </Card>
      )}
    </div>
  );
};

export default TrainingDashboard;
