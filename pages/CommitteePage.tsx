
import React from 'react';
import { COMMITTEE_STRUCTURE } from '../constants';
import type { CommitteeMember } from '../types';
import LazyImage from '../components/Image';
import { Phone } from 'lucide-react';

const CommitteeMemberCard: React.FC<{ member: CommitteeMember, level: number, isLast: boolean }> = ({ member, level, isLast }) => {
    const hasChildren = member.children && member.children.length > 0;
    return (
        <div className="relative pl-8">
            {/* Vertical line from parent */}
            <div className="absolute left-4 top-0 w-px h-full bg-slate-300 dark:bg-slate-600"></div>
            {/* Horizontal line to card */}
            <div className={`absolute left-4 w-4 h-px bg-slate-300 dark:bg-slate-600 ${level > 0 ? 'top-14' : 'top-12'}`}></div>
            {/* Removes bottom part of vertical line for the last child */}
            {isLast && <div className={`absolute left-4 w-px bg-background dark:bg-slate-900 ${level > 0 ? 'top-14' : 'top-12'} bottom-0`}></div>}

            <div className="relative mb-4">
                <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80">
                    <LazyImage src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full flex-shrink-0" />
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-text-primary dark:text-slate-200">{member.name}</h3>
                        <p className="text-primary font-semibold">{member.role}</p>
                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400 mt-1">
                            <Phone size={14} />
                            <span>{member.contact}</span>
                        </div>
                    </div>
                </div>
            </div>
             {hasChildren && (
                <div className="space-y-4">
                    {member.children?.map((child, index) => (
                        <CommitteeMemberCard 
                            key={child.id} 
                            member={child} 
                            level={level + 1}
                            isLast={index === (member.children?.length ?? 0) - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommitteePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Society Committee</h1>
      <div className="max-w-3xl mx-auto">
        {COMMITTEE_STRUCTURE.map((member, index) => (
             <CommitteeMemberCard 
                key={member.id} 
                member={member} 
                level={0}
                isLast={index === COMMITTEE_STRUCTURE.length - 1}
            />
        ))}
      </div>
    </div>
  );
};

export default CommitteePage;
