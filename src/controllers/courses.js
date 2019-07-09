var coursesController =(function(){
    
    var students =[];
    var setCoursesArray =(object) =>{
        courses.push(object.student_id)
    }

    var addStudent = (studentObject)=>{
        students.push(studentObject);
    }

    return{
          getCourses : ()=>{
            return courses;
           },

           setCourses: (object)=>{
                setCoursesArray(object)
           },
           addStudentCourse: (studentObject)=>{
                addStudent(studentObject);
           },
           getStudents:()=>{
               return students;
           }

        
    }


}());

module.exports= coursesController;

