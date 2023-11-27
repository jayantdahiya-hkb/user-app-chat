import { useState, useRef } from 'react';
import { useAppContext } from '../App';

const FAQComponent = ({ faqData }) => {
    const chatBoxRef = useRef(null);
    const { addMessage } = useAppContext();
    const [openCategories, setOpenCategories] = useState({});

    const toggleCategory = (id) => {
        setOpenCategories(prevState => {
            return { ...prevState, [id]: !prevState[id] };
        });
    };

    const handleQuestionClick = (categoryLabel, question) => {
        addMessage(question.label, 'user');
        addMessage(`This is the sample faq reply for ${categoryLabel}.`, 'faq');
        addMessage('Are you satisfied with this reply?', 'selection-trigger');
    };

    const categoryClass = "mx-3 border-2 border-yellow-600 rounded-lg p-4 my-2 shadow-md shadow-yellow-400/30 hover:bg-yellow-500 hover:text-white hover:shadow-yellow-500/30 hover:border-gray-200 hover:cursor-pointer";

    const Category = ({ category }) => {
        return (
            <div key={category._id}>
                <div
                    onClick={() => toggleCategory(category._id)}
                    className={`${categoryClass} ${openCategories[category._id] ? 'bg-yellow-500 text-white shadow-yellow-500/30' : ''}`}
                >
                    <p>{category.label}</p>
                </div>
                {openCategories[category._id] && <Questions category={category} />}
            </div>
        );
    };

    const Questions = ({ category }) => {
        if (category.questions.length === 0) {
            return <p>No questions found for this category.</p>;
        }
        return (
            <div>
                {category.questions.map((question) => (
                    <div
                        key={question._id}
                        onClick={() => handleQuestionClick(category.label, question)}
                        className={categoryClass}
                    >
                        <p>{question.label}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        !faqData ? null :
            <div ref={chatBoxRef}>
                {faqData.map((category) => <Category key={category._id} category={category} />)}
            </div>
    );
};

export default FAQComponent;