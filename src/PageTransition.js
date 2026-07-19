import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' } },
};

/**
 * Wraps a page's content with a consistent fade/slide transition. Several
 * pages previously used their own ad-hoc motion.div (some missing `exit`,
 * some with no animation at all), which made navigation feel inconsistent.
 * This is the one place that timing/easing lives now.
 */
const PageTransition = ({ children, className }) => (
    <motion.div className={className} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        {children}
    </motion.div>
);

export default PageTransition;
