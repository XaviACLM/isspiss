import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export function ExplanationPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 lg:right-84
                   text-xs text-gray-400 hover:text-gray-600
                   bg-[#faf8f5]/80 hover:bg-[#faf8f5] px-3 py-2 border border-gray-200
                   transition-colors cursor-pointer z-40 font-serif"
      >
        What?
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50 lg:backdrop-blur-md" />
      
      <div className="fixed inset-0 lg:inset-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                      bg-[#faf8f5] border border-gray-200 z-50 overflow-auto
                      lg:max-w-160 lg:max-h-[80vh] lg:w-full">
        
        <button
		  onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 
                     transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        
        <div className="p-8 pt-12">
          <div className="space-y-4 text-gray-700">
            <p>
              This is a website that provides real-time information about whether someone aboard the International Space Station is currently taking a piss.
              The people to blame are Xavi Arnal (
			  <a
                href="https://xaviaclm.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 
                           transition-colors translate-y-1"
              >
                <FontAwesomeIcon icon={faGlobe} />
              </a>
			  ,
			  <a
                href="https://github.com/XaviACLM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 
                           transition-colors translate-y-1"
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>
			  ,
			  <a
                href="https://www.linkedin.com/in/xavi-arnal-524256218/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 
                           transition-colors translate-y-1"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
			  ) and Marcel Vilasís (
			  <a
                href="https://www.bigassmessage.com/4naff"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 
                           transition-colors translate-y-1"
              >
                <FontAwesomeIcon icon={faGlobe} />
              </a>
			  ,
			  <a
                href="https://www.bigassmessage.com/yffgd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 
                           transition-colors translate-y-1"
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>
			  ,
			  <a
                href="https://www.linkedin.com/in/marcel-vilasis-gasulla/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 
                           transition-colors translate-y-1"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
			  ).
            </p>
            
            <p>
			  This website benefits from:
			  <ul className="list-disc list-outside pl-6 space-y-0 text-gray-700">
			    <li>The ISSLive! public telemetry feed, delivered via Lightstreamer, for status data about the urine tank on the ISS.</li>
			    <li>
				  The{" "}
				  <a
					href="https://thespacedevs.com/llapi"
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-400 hover:text-gray-800 
							   transition-colors"
				  >
					Launch Library 2 API
				  </a>
				  ,	for data about who is aboard the ISS.
				</li>
			    <li>
				  <a
					href="https://gifcities.org"
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-400 hover:text-gray-800 
							   transition-colors"
				  >
					gifcities.org
				  </a>
				  , for — well, you know. Or you will.
				</li>
			  </ul>
            </p>
            
            <p>
			  More information about these, as well as the website itself, may be found at its{" "}
			  <a
                href="https://github.com/XaviACLM/isspiss"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-800 
                           transition-colors"
              >
                GitHub repository
              </a>
			  .
			  Almost everything within was written by Claude Code.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}