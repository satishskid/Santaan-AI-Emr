import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui/DesignSystem';
import { 
  HeartIcon, 
  BrainIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  TrendingUpIcon,
  UserIcon
} from './icons';

interface PatientVibeAppProps {
  patientId: string;
  language: 'hindi' | 'tamil' | 'bengali' | 'english' | 'telugu' | 'marathi' | 'gujarati';
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'breathing' | 'meditation' | 'cognitive' | 'mindfulness';
  completed: boolean;
  culturallyAdapted: boolean;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  dueTime: string;
  completed: boolean;
  type: 'exercise' | 'journal' | 'medication_reminder' | 'appointment';
}

const PatientVibeApp: React.FC<PatientVibeAppProps> = ({ patientId, language }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'exercises' | 'progress' | 'resources'>('home');
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progressData, setProgressData] = useState({
    stressLevel: 6,
    moodScore: 7,
    anxietyLevel: 5,
    weeklyProgress: 78
  });

  useEffect(() => {
    loadPatientData();
  }, [patientId, language]);

  const loadPatientData = () => {
    // Load culturally adapted content based on language
    const mockTasks = generateCulturallyAdaptedTasks(language);
    const mockExercises = generateCulturallyAdaptedExercises(language);
    
    setDailyTasks(mockTasks);
    setExercises(mockExercises);
  };

  const generateCulturallyAdaptedTasks = (lang: string): DailyTask[] => {
    const tasks = {
      hindi: [
        {
          id: 'task_1',
          title: 'प्राणायाम अभ्यास',
          description: 'सुबह 10 मिनट गहरी सांस लेने का अभ्यास करें',
          dueTime: '08:00',
          completed: false,
          type: 'exercise' as const
        },
        {
          id: 'task_2',
          title: 'दैनिक डायरी',
          description: 'आज की भावनाओं और विचारों को लिखें',
          dueTime: '20:00',
          completed: false,
          type: 'journal' as const
        }
      ],
      english: [
        {
          id: 'task_1',
          title: 'Morning Breathing Exercise',
          description: 'Practice deep breathing for 10 minutes',
          dueTime: '08:00',
          completed: false,
          type: 'exercise' as const
        },
        {
          id: 'task_2',
          title: 'Daily Journal',
          description: 'Write about your feelings and thoughts today',
          dueTime: '20:00',
          completed: false,
          type: 'journal' as const
        }
      ],
      tamil: [
        {
          id: 'task_1',
          title: 'காலை மூச்சுப் பயிற்சி',
          description: '10 நிமிடங்கள் ஆழமான மூச்சுப் பயிற்சி செய்யுங்கள்',
          dueTime: '08:00',
          completed: false,
          type: 'exercise' as const
        },
        {
          id: 'task_2',
          title: 'தினசரி நாட்குறிப்பு',
          description: 'இன்றைய உணர்வுகள் மற்றும் எண்ணங்களை எழுதுங்கள்',
          dueTime: '20:00',
          completed: false,
          type: 'journal' as const
        }
      ]
    };
    
    return tasks[lang] || tasks.english;
  };

  const generateCulturallyAdaptedExercises = (lang: string): Exercise[] => {
    const exercises = {
      hindi: [
        {
          id: 'ex_1',
          title: 'ध्यान साधना',
          description: 'पारंपरिक भारतीय ध्यान तकनीक',
          duration: 15,
          type: 'meditation' as const,
          completed: false,
          culturallyAdapted: true
        },
        {
          id: 'ex_2',
          title: 'सकारात्मक चिंतन',
          description: 'नकारात्मक विचारों को सकारात्मक में बदलना',
          duration: 10,
          type: 'cognitive' as const,
          completed: false,
          culturallyAdapted: true
        }
      ],
      english: [
        {
          id: 'ex_1',
          title: 'Mindfulness Meditation',
          description: 'Traditional mindfulness practice adapted for fertility journey',
          duration: 15,
          type: 'meditation' as const,
          completed: false,
          culturallyAdapted: true
        },
        {
          id: 'ex_2',
          title: 'Cognitive Restructuring',
          description: 'Transform negative thoughts into positive ones',
          duration: 10,
          type: 'cognitive' as const,
          completed: false,
          culturallyAdapted: true
        }
      ],
      tamil: [
        {
          id: 'ex_1',
          title: 'தியான பயிற்சி',
          description: 'பாரம்பரிய தமிழ் தியான முறைகள்',
          duration: 15,
          type: 'meditation' as const,
          completed: false,
          culturallyAdapted: true
        },
        {
          id: 'ex_2',
          title: 'நேர்மறை சிந்தனை',
          description: 'எதிர்மறை எண்ணங்களை நேர்மறையாக மாற்றுதல்',
          duration: 10,
          type: 'cognitive' as const,
          completed: false,
          culturallyAdapted: true
        }
      ]
    };
    
    return exercises[lang] || exercises.english;
  };

  const completeTask = (taskId: string) => {
    setDailyTasks(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  const completeExercise = (exerciseId: string) => {
    setExercises(exercises => 
      exercises.map(exercise => 
        exercise.id === exerciseId ? { ...exercise, completed: true } : exercise
      )
    );
  };

  const getGreeting = (lang: string) => {
    const greetings = {
      hindi: 'नमस्ते! आज आपका दिन कैसा है?',
      english: 'Hello! How are you feeling today?',
      tamil: 'வணக்கம்! இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
      bengali: 'নমস্কার! আজ আপনার কেমন লাগছে?',
      telugu: 'నమస్కారం! ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?',
      marathi: 'नमस्कार! आज तुम्हाला कसे वाटते आहे?',
      gujarati: 'નમસ્તે! આજે તમને કેવું લાગે છે?'
    };
    return greetings[lang] || greetings.english;
  };

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Greeting */}
      <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <HeartIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{getGreeting(language)}</h2>
            <p className="text-gray-600">
              {language === 'hindi' ? 'आपकी यात्रा में हम आपके साथ हैं' : 
               language === 'tamil' ? 'உங்கள் பயணத்தில் நாங்கள் உங்களுடன் இருக்கிறோம்' :
               'We are with you on your journey'}
            </p>
          </div>
        </div>
      </Card>

      {/* Today's Progress */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'hindi' ? 'आज की प्रगति' : 
           language === 'tamil' ? 'இன்றைய முன்னேற்றம்' : 
           'Today\'s Progress'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dailyTasks.filter(t => t.completed).length}/{dailyTasks.length}</div>
            <div className="text-sm text-gray-600">
              {language === 'hindi' ? 'कार्य पूर्ण' : 
               language === 'tamil' ? 'பணிகள் முடிந்தது' : 
               'Tasks Complete'}
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{progressData.weeklyProgress}%</div>
            <div className="text-sm text-gray-600">
              {language === 'hindi' ? 'साप्ताहिक प्रगति' : 
               language === 'tamil' ? 'வாராந்திர முன்னேற்றம்' : 
               'Weekly Progress'}
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Tasks */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'hindi' ? 'आज के कार्य' : 
           language === 'tamil' ? 'இன்றைய பணிகள்' : 
           'Today\'s Tasks'}
        </h3>
        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => completeTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && <CheckCircleIcon className="h-4 w-4 text-white" />}
                </button>
                <div>
                  <div className={`font-medium ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-600">{task.description}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{task.dueTime}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Mood Check */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'hindi' ? 'मूड चेक' : 
           language === 'tamil' ? 'மனநிலை சரிபார்ப்பு' : 
           'Quick Mood Check'}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '😊', label: language === 'hindi' ? 'खुश' : language === 'tamil' ? 'மகிழ்ச்சி' : 'Happy' },
            { emoji: '😐', label: language === 'hindi' ? 'ठीक' : language === 'tamil' ? 'சரி' : 'Okay' },
            { emoji: '😔', label: language === 'hindi' ? 'उदास' : language === 'tamil' ? 'சோகம்' : 'Sad' }
          ].map((mood, index) => (
            <button
              key={index}
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className="text-sm text-gray-600">{mood.label}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderExercisesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {language === 'hindi' ? 'अभ्यास और तकनीकें' : 
         language === 'tamil' ? 'பயிற்சிகள் மற்றும் நுட்பங்கள்' : 
         'Exercises & Techniques'}
      </h2>
      
      {exercises.map((exercise) => (
        <Card key={exercise.id} variant="elevated" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BrainIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{exercise.title}</h3>
                <p className="text-gray-600 text-sm">{exercise.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="info" size="sm">{exercise.duration} min</Badge>
                  {exercise.culturallyAdapted && (
                    <Badge variant="success" size="sm">
                      {language === 'hindi' ? 'सांस्कृतिक रूप से अनुकूलित' : 
                       language === 'tamil' ? 'கலாச்சார ரீதியாக தழுவல்' : 
                       'Culturally Adapted'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant={exercise.completed ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => completeExercise(exercise.id)}
              disabled={exercise.completed}
            >
              {exercise.completed ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {language === 'hindi' ? 'पूर्ण' : language === 'tamil' ? 'முடிந்தது' : 'Done'}
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-1" />
                  {language === 'hindi' ? 'शुरू करें' : language === 'tamil' ? 'தொடங்கு' : 'Start'}
                </>
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {language === 'hindi' ? 'आपकी प्रगति' : 
         language === 'tamil' ? 'உங்கள் முன்னேற்றம்' : 
         'Your Progress'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {language === 'hindi' ? 'तनाव का स्तर' : 
             language === 'tamil' ? 'மன அழுத்த நிலை' : 
             'Stress Level'}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(10 - progressData.stressLevel) * 10}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{progressData.stressLevel}/10</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'hindi' ? 'कम बेहतर है' : 
             language === 'tamil' ? 'குறைவு சிறந்தது' : 
             'Lower is better'}
          </p>
        </Card>

        <Card variant="elevated" className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {language === 'hindi' ? 'मूड स्कोर' : 
             language === 'tamil' ? 'மனநிலை மதிப்பெண்' : 
             'Mood Score'}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressData.moodScore * 10}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{progressData.moodScore}/10</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'hindi' ? 'अधिक बेहतर है' : 
             language === 'tamil' ? 'அதிகம் சிறந்தது' : 
             'Higher is better'}
          </p>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HeartIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vibe</h1>
            <p className="text-sm text-gray-600">
              {language === 'hindi' ? 'आपका व्यक्तिगत सहायक' : 
               language === 'tamil' ? 'உங்கள் தனிப்பட்ட உதவியாளர்' : 
               'Your Personal Companion'}
            </p>
          </div>
        </div>
        <Badge variant="success" size="sm">
          {language === 'hindi' ? 'ऑनलाइन' : 
           language === 'tamil' ? 'ஆன்லைன்' : 
           'Online'}
        </Badge>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'home', label: language === 'hindi' ? 'होम' : language === 'tamil' ? 'முகப்பு' : 'Home', icon: UserIcon },
          { id: 'exercises', label: language === 'hindi' ? 'अभ्यास' : language === 'tamil' ? 'பயிற்சிகள்' : 'Exercises', icon: BrainIcon },
          { id: 'progress', label: language === 'hindi' ? 'प्रगति' : language === 'tamil' ? 'முன்னேற்றம்' : 'Progress', icon: TrendingUpIcon },
          { id: 'resources', label: language === 'hindi' ? 'संसाधन' : language === 'tamil' ? 'வளங்கள்' : 'Resources', icon: BookOpenIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'exercises' && renderExercisesTab()}
      {activeTab === 'progress' && renderProgressTab()}
      {activeTab === 'resources' && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'hindi' ? 'संसाधन और सामग्री' : 
             language === 'tamil' ? 'வளங்கள் மற்றும் பொருட்கள்' : 
             'Resources & Materials'}
          </h3>
          <p className="text-gray-600">
            {language === 'hindi' ? 'शैक्षिक सामग्री और सहायता संसाधन' : 
             language === 'tamil' ? 'கல்வி பொருட்கள் மற்றும் ஆதரவு வளங்கள்' : 
             'Educational materials and support resources'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientVibeApp;
