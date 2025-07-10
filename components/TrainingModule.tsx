import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Card, Badge, Button } from './ui/DesignSystem';
import { 
  BookOpenIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  TrophyIcon
} from './icons';
import { 
  TrainingService, 
  TrainingModule as TrainingModuleType, 
  TrainingSection,
  TrainingContent,
  Quiz,
  QuizQuestion
} from '../services/trainingService';

interface TrainingModuleProps {
  moduleId: string;
  userId: string;
  userRole: UserRole;
  onComplete?: (moduleId: string, score?: number) => void;
  onExit?: () => void;
}

const TrainingModule: React.FC<TrainingModuleProps> = ({
  moduleId,
  userId,
  userRole,
  onComplete,
  onExit
}) => {
  const [module, setModule] = useState<TrainingModuleType | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const trainingModule = TrainingService.getTrainingModule(moduleId);
    setModule(trainingModule);
    
    if (trainingModule) {
      const currentProgress = TrainingService.getProgress(moduleId, userId);
      setProgress(currentProgress);
    }
  }, [moduleId, userId]);

  useEffect(() => {
    if (module) {
      const totalSections = module.sections.length;
      const totalContent = module.sections.reduce((sum, section) => sum + section.content.length, 0);
      const currentPosition = module.sections.slice(0, currentSectionIndex).reduce((sum, section) => sum + section.content.length, 0) + currentContentIndex;
      const newProgress = Math.round((currentPosition / totalContent) * 100);
      setProgress(newProgress);
      TrainingService.updateProgress(moduleId, userId, newProgress);
    }
  }, [currentSectionIndex, currentContentIndex, module, moduleId, userId]);

  if (!module) {
    return (
      <Card variant="elevated" className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Module Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">The requested training module could not be loaded.</p>
      </Card>
    );
  }

  const currentSection = module.sections[currentSectionIndex];
  const currentContent = currentSection?.content[currentContentIndex];
  const isLastContent = currentSectionIndex === module.sections.length - 1 && 
                       currentContentIndex === currentSection.content.length - 1;

  const handleNext = () => {
    if (currentContentIndex < currentSection.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (currentSectionIndex < module.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentContentIndex(0);
    } else if (module.quiz) {
      setShowQuiz(true);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      const prevSection = module.sections[currentSectionIndex - 1];
      setCurrentContentIndex(prevSection.content.length - 1);
    }
  };

  const handleComplete = (score?: number) => {
    TrainingService.markModuleCompleted(moduleId, userId);
    TrainingService.updateProgress(moduleId, userId, 100);
    onComplete?.(moduleId, score);
  };

  const handleQuizSubmit = () => {
    if (!module.quiz) return;
    
    const results = TrainingService.validateQuizAnswers(moduleId, quizAnswers);
    setQuizResults(results);
    
    if (results.passed) {
      handleComplete(results.score);
    }
  };

  const renderContent = (content: TrainingContent) => {
    switch (content.type) {
      case 'text':
        return (
          <div className="prose dark:prose-invert max-w-none">
            {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{content.content}</p>
            {content.metadata && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Technical Details</h4>
                <div className="space-y-2 text-sm">
                  {content.metadata.dataType && (
                    <div><span className="font-medium">Data Type:</span> {content.metadata.dataType}</div>
                  )}
                  {content.metadata.semantics && (
                    <div><span className="font-medium">Semantics:</span> {content.metadata.semantics}</div>
                  )}
                  {content.metadata.correlations && (
                    <div><span className="font-medium">Correlations:</span> {content.metadata.correlations.join(', ')}</div>
                  )}
                  {content.metadata.derivedValues && (
                    <div><span className="font-medium">Derived Values:</span> {content.metadata.derivedValues.join(', ')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'table':
        return (
          <div>
            {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
            <div className="overflow-x-auto">
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
            {content.metadata && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Data Insights</h4>
                <div className="space-y-2 text-sm">
                  {content.metadata.semantics && (
                    <div><span className="font-medium">Purpose:</span> {content.metadata.semantics}</div>
                  )}
                  {content.metadata.correlations && (
                    <div><span className="font-medium">Key Relationships:</span> {content.metadata.correlations.join(', ')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'diagram':
        return (
          <div>
            {content.title && <h3 className="text-lg font-semibold mb-3">{content.title}</h3>}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <div className="text-lg font-mono text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {content.content}
                </div>
              </div>
            </div>
            {content.metadata && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Flow Analysis</h4>
                <div className="space-y-2 text-sm">
                  {content.metadata.semantics && (
                    <div><span className="font-medium">Flow Purpose:</span> {content.metadata.semantics}</div>
                  )}
                  {content.metadata.correlations && (
                    <div><span className="font-medium">Data Dependencies:</span> {content.metadata.correlations.join(' → ')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return <div className="text-gray-500">Content type not supported</div>;
    }
  };

  const renderQuiz = () => {
    if (!module.quiz) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <QuestionMarkCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{module.quiz.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Passing Score: {module.quiz.passingScore}% | Time Limit: {module.quiz.timeLimit || 'Unlimited'}
          </p>
        </div>

        {quizResults ? (
          <Card variant="elevated" className="p-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                quizResults.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {quizResults.passed ? <CheckCircleIcon className="h-8 w-8" /> : <TrophyIcon className="h-8 w-8" />}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {quizResults.passed ? 'Congratulations!' : 'Keep Learning!'}
              </h3>
              <p className="text-lg mb-4">Your Score: {quizResults.score}%</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {quizResults.passed 
                  ? 'You have successfully completed this module and earned certification!'
                  : `You need ${module.quiz.passingScore}% to pass. Review the material and try again.`
                }
              </p>
              <div className="space-x-2">
                {quizResults.passed && (
                  <Button onClick={() => handleComplete(quizResults.score)} variant="primary">
                    Complete Module
                  </Button>
                )}
                <Button onClick={() => setShowQuiz(false)} variant="secondary">
                  Review Material
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {module.quiz.questions.map((question, index) => (
              <Card key={question.id} variant="elevated" className="p-6">
                <h4 className="font-semibold mb-3">
                  Question {index + 1}: {question.question}
                </h4>
                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={quizAnswers[question.id] === option}
                          onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            ))}
            
            <div className="flex justify-center">
              <Button 
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < module.quiz.questions.length}
                variant="primary"
                className="px-8"
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button onClick={() => setShowQuiz(false)} variant="secondary" className="flex items-center space-x-2">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Module</span>
          </Button>
        </div>
        {renderQuiz()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{module.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{module.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="info">{module.difficulty}</Badge>
            <Badge variant="secondary">
              <ClockIcon className="h-3 w-3 mr-1" />
              {module.estimatedDuration}min
            </Badge>
            {module.certification && (
              <Badge variant="success">
                <AcademicCapIcon className="h-3 w-3 mr-1" />
                Certification
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress: {progress}%</span>
          <span>Section {currentSectionIndex + 1} of {module.sections.length}</span>
        </div>
      </div>

      {/* Content */}
      <Card variant="elevated" className="p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {currentSection.title}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Content {currentContentIndex + 1} of {currentSection.content.length}
          </div>
        </div>

        {currentContent && renderContent(currentContent)}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0 && currentContentIndex === 0}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-2">
          {onExit && (
            <Button onClick={onExit} variant="secondary">
              Exit Training
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <span>{isLastContent ? (module.quiz ? 'Take Quiz' : 'Complete') : 'Next'}</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TrainingModule;
